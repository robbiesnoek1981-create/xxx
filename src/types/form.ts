export type Wijk =
  | 'Noord'
  | 'Oost'
  | 'Binnenstad'
  | 'West'
  | 'Overige';

export type Doelgroep =
  | 'Jeugd & Gezin'
  | 'Volwassenen';

export type Leefdomein =
  | 'Samenleven'
  | 'Werk'
  | 'Vrije tijd'
  | 'Inkomen'
  | 'Financiën'
  | 'Wonen'
  | 'Ontwikkelen'
  | 'Veiligheid'
  | 'Gezondheid';

export type KortContactMet =
  | 'Inwoner'
  | 'Samenwerkingspartner';

export interface FormState {
  wijk: Wijk | null;
  doelgroep: Doelgroep | null;
  leefdomeinen: Set<Leefdomein>;
  kortContactMet: KortContactMet | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof FormState, string>>;
}
