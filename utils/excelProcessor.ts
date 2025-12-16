import * as XLSX from 'xlsx';
import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';
import { ProcessedRow, ProcessingStats } from '../types';

export const readExcelFile = async (file: File): Promise<ProcessedRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as ProcessedRow[];
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const processData = (data: ProcessedRow[]): { processed: ProcessedRow[]; stats: ProcessingStats } => {
  // Region names in French
  const regionNames = new Intl.DisplayNames(['fr'], { type: 'region' });

  let identified = 0;
  let unknown = 0;

  const processed = data.map((row, index) => {
    const phoneNumber = row['Numéro'];
    let countryName = 'Inconnu';

    if (phoneNumber) {
      try {
        // Parse the phone number
        const phoneNumberStr = String(phoneNumber);
        const parsed = parsePhoneNumber(phoneNumberStr);
        
        if (parsed && parsed.country) {
          countryName = regionNames.of(parsed.country) || parsed.country;
          identified++;
        } else {
          unknown++;
        }
      } catch (error) {
        unknown++;
      }
    } else {
      unknown++;
    }

    return {
      ...row,
      Pays: countryName,
      OriginalIndex: index,
      callStatus: null, // Initialize with no status
    };
  });

  return {
    processed,
    stats: {
      total: data.length,
      identified,
      unknown,
    },
  };
};

export const exportToExcel = (data: ProcessedRow[], filename: string) => {
  // Map data to include the specific "Suite appel effectué" column text
  const cleanData = data.map(({ OriginalIndex, callStatus, ...rest }) => {
    let callStatusText = '';
    if (callStatus === 'ANSWERED') callStatusText = "Patient a pris l'appel";
    if (callStatus === 'NO_ANSWER') callStatusText = "Patient n'a pas pris l'appel";

    return {
      ...rest,
      'Suite appel effectué': callStatusText
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(cleanData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultats');
  XLSX.writeFile(workbook, filename);
};