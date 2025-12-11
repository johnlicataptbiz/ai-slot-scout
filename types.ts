export interface SlotsByDate {
  [dateISO: string]: string[];
}

export interface CadenceSlots {
  [dateISO: string]: string[];
}

export interface Time24h {
  hour: number;
  minute: number;
}

export interface TimezoneOption {
  name: string;
  abbreviation: string;
}