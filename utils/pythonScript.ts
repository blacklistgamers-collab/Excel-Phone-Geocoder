export const PYTHON_SCRIPT_CONTENT = `"""
Script d'enrichissement de données géographiques basé sur les numéros de téléphone.

PRÉ-REQUIS :
Installez les bibliothèques nécessaires via pip :
pip install pandas phonenumbers openpyxl
"""

import pandas as pd
import phonenumbers
from phonenumbers import geocoder
import os

def get_country_from_number(phone_number):
    """
    Analyse un numéro de téléphone et retourne le nom du pays en français.
    
    Args:
        phone_number (str): Le numéro de téléphone à analyser.
        
    Returns:
        str: Le nom du pays ou 'Inconnu' si le numéro est invalide.
    """
    try:
        # Conversion en chaîne de caractères pour éviter les erreurs de type
        phone_str = str(phone_number).strip()
        
        # Si le numéro est vide, retourner Inconnu
        if not phone_str:
            return "Inconnu"
            
        # Tenter d'analyser le numéro
        # Le deuxième argument None implique qu'on attend un format international (ex: +33...)
        # ou que le numéro contient déjà l'indicatif.
        parsed_number = phonenumbers.parse(phone_str, None)
        
        # Vérifier si le numéro est valide
        if not phonenumbers.is_valid_number(parsed_number):
            return "Inconnu"
            
        # Obtenir le nom du pays en français (locale='fr')
        country_name = geocoder.description_for_number(parsed_number, "fr")
        
        return country_name if country_name else "Inconnu"
        
    except Exception as e:
        # En cas d'erreur de parsing (ex: format incorrect), retourner Inconnu
        return "Inconnu"

def process_excel_file(input_file, output_file):
    """
    Charge un fichier Excel, ajoute la colonne Pays et sauvegarde le résultat.
    """
    print(f"Lecture du fichier : {input_file}")
    
    try:
        # Chargement du fichier Excel
        df = pd.read_excel(input_file)
        
        # Vérification de l'existence de la colonne 'Numéro'
        if 'Numéro' not in df.columns:
            print("Erreur : La colonne 'Numéro' est manquante dans le fichier source.")
            return

        print("Traitement des numéros de téléphone en cours...")
        
        # Application de la fonction sur la colonne 'Numéro'
        # On utilise apply pour traiter chaque ligne
        df['Pays'] = df['Numéro'].apply(get_country_from_number)
        
        # Sauvegarde du résultat
        print(f"Sauvegarde du fichier : {output_file}")
        df.to_excel(output_file, index=False)
        
        print("Traitement terminé avec succès !")
        print(f"Aperçu des 5 premières lignes :\n")
        print(df[['Numéro', 'Pays']].head())
        
    except FileNotFoundError:
        print(f"Erreur : Le fichier {input_file} est introuvable.")
    except Exception as e:
        print(f"Une erreur inattendue est survenue : {e}")

if __name__ == "__main__":
    # Noms des fichiers d'entrée et de sortie définis dans les spécifications
    INPUT_FILENAME = 'input.xlsx'
    OUTPUT_FILENAME = 'output_avec_pays.xlsx'
    
    process_excel_file(INPUT_FILENAME, OUTPUT_FILENAME)
`;