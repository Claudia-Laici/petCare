export const APPOINTMENT_TYPES = {
  visit: "Visita",
  checkup: "Controllo",
  vaccination: "Vaccinazione",
  exam: "Esame",
  surgery: "Intervento",
  other: "Altro",
};

export const APPOINTMENT_STATUSES = {
  scheduled: { label: "In programma", variant: "success" },
  completed: { label: "Completato", variant: "secondary" },
  cancelled: { label: "Annullato", variant: "danger" },
};

export const FIELD_LABELS = {
  notes: "Note",
  vetQuestions: "Domande per il veterinario",
  attendeeInstructions: "Indicazioni per chi accompagna",
};

export const SHARE_FIELDS = [
  { key: "petName", label: "Nome dell'animale", defaultChecked: true },
  { key: "dateTime", label: "Data e ora", defaultChecked: true },
  { key: "location", label: "Luogo", defaultChecked: true },
  { key: "veterinarian", label: "Veterinario", defaultChecked: true },
  { key: "notes", label: FIELD_LABELS.notes, defaultChecked: false },
  {
    key: "vetQuestions",
    label: FIELD_LABELS.vetQuestions,
    defaultChecked: false,
  },
  {
    key: "attendeeInstructions",
    label: FIELD_LABELS.attendeeInstructions,
    defaultChecked: false,
  },
];