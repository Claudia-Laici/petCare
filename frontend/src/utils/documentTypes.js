export const DOCUMENT_TYPES = [
  { value: "referto", label: "Referto", plural: "Referti" },
  { value: "analisi", label: "Analisi", plural: "Analisi" },
  {
    value: "prescrizione",
    label: "Prescrizione",
    plural: "Prescrizioni",
  },
  {
    value: "vaccinazione",
    label: "Vaccinazione",
    plural: "Vaccinazioni",
  },
  { value: "altro", label: "Altro", plural: "Altro" },
];

export const DOCUMENT_TYPE_LABELS = Object.fromEntries(
  DOCUMENT_TYPES.map((type) => [type.value, type.label]),
);
