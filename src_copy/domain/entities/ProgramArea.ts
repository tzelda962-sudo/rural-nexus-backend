export interface ProgramArea {
  id: string;
  code: string; // e.g., 'PA1'
  title: string;
  description: string;
  icon: string;
  colorTheme: string;
  sdgs: { code: string, title: string, color: string }[];
  initiatives: { title: string, desc: string }[];
}
