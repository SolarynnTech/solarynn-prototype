import { create } from "zustand";
import { v4 as uuid } from "uuid";

const useQuestionnaireStore = create((set) => ({
  forms: [
    {
      id: uuid(),
      name: "Fashion",
      part: 1,
      pages: [
        {
          pageNumber: 1,
          sections: [
            {
              title: "Body Measurements",
              questions: [
                {
                  id: uuid(),
                  label: "Height:",
                  type: "number",
                  suffix: "CM",
                  value: "",
                },
                {
                  id: uuid(),
                  label: "Weight:",
                  type: "number",
                  suffix: "KG",
                  value: "",
                },
                {
                  id: uuid(),
                  label: "Bust / Chest:",
                  type: "number",
                  value: "",
                },
                {
                  id: uuid(),
                  label: "Waist:",
                  type: "number",
                  value: "",
                },
                {
                  id: uuid(),
                  label: "Hips:",
                  type: "number",
                  value: "",
                },
                {
                  id: uuid(),
                  label: "Inseam:",
                  type: "number",
                  value: "",
                },
                {
                  id: uuid(),
                  label: "Shoulder Width:",
                  type: "number",
                  value: "",
                },
                {
                  id: uuid(),
                  label: "Arm Length:",
                  type: "number",
                  value: "",
                },
              ],
            },
          ],
        },
        {
          pageNumber: 2,
          sections: [
            {
              title: "Top Sizes",
              questions: [
                {
                  id: uuid(),
                  label: "T-Shirt / Blouse Size:",
                  type: "select",
                  value: "",
                  options: [
                    { value: "xs", label: "XS" },
                    { value: "s", label: "S" },
                    { value: "m", label: "M" },
                    { value: "l", label: "L" },
                    { value: "xl", label: "XL" },
                    { value: "xxl", label: "XXL" },
                  ],
                },
                {
                  id: uuid(),
                  label: "Jacket / Coat Size:",
                  type: "select",
                  value: "",
                  options: [
                    { value: "xs", label: "XS" },
                    { value: "s", label: "S" },
                    { value: "m", label: "M" },
                    { value: "l", label: "L" },
                    { value: "xl", label: "XL" },
                    { value: "xxl", label: "XXL" },
                  ],
                },
                {
                  id: uuid(),
                  label: "Fit Preference:",
                  type: "select",
                  value: "",
                  options: [
                    { value: "normal", label: "Normal Fit" },
                    { value: "tight", label: "Tight Fit" },
                    { value: "loose", label: "Loose Fit" },
                  ],
                },
              ],
            },
            {
              title: "Bottom Sizes",
              questions: [
                {
                  id: uuid(),
                  label: "Pants Size:",
                  type: "select",
                  value: "",
                  options: [
                    { value: "xs", label: "XS" },
                    { value: "s", label: "S" },
                    { value: "m", label: "M" },
                    { value: "l", label: "L" },
                    { value: "xl", label: "XL" },
                    { value: "xxl", label: "XXL" },
                  ],
                },
                {
                  id: uuid(),
                  label: "Skirt Size:",
                  type: "select",
                  value: "",
                  options: [
                    { value: "xs", label: "XS" },
                    { value: "s", label: "S" },
                    { value: "m", label: "M" },
                    { value: "l", label: "L" },
                    { value: "xl", label: "XL" },
                    { value: "xxl", label: "XXL" },
                  ],
                },
                {
                  id: uuid(),
                  label: "Fit Preference:",
                  type: "select",
                  value: "",
                  options: [
                    { value: "normal", label: "Normal Fit" },
                    { value: "tight", label: "Tight Fit" },
                    { value: "loose", label: "Loose Fit" },
                  ],
                },
                {
                  id: uuid(),
                  label: "Dress Size (If Applicable):",
                  type: "select",
                  value: "",
                  options: [
                    { value: "xs", label: "XS" },
                    { value: "s", label: "S" },
                    { value: "m", label: "M" },
                    { value: "l", label: "L" },
                    { value: "xl", label: "XL" },
                    { value: "xxl", label: "XXL" },
                  ],
                },
              ],
            },
          ],
        },

        {
          pageNumber: 3,
          sections: [
            {
              title: "Footwear",
              questions: [
                {
                  id: uuid(),
                  label: "Shoe Size:",
                  type: "number",
                  value: "",
                },
                {
                  id: uuid(),
                  label: "Width:",
                  type: "number",
                  value: "",
                },
                {
                  id: uuid(),
                  label: "Preferred Heel Height :",
                  type: "select",
                  value: "",
                  options: [
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                  ],
                },
              ],
            },
            {
              title: "Headwear",
              questions: [
                {
                  id: uuid(),
                  label: "Hat Size:",
                  type: "number",
                  value: "",
                },
                {
                  id: uuid(),
                  label: "Hat Fit:",
                  type: "select",
                  value: "",
                  options: [
                    { value: "normal", label: "Normal Fit" },
                    { value: "tight", label: "Tight Fit" },
                    { value: "loose", label: "Loose Fit" },
                  ],
                },
              ],
            },
          ],
        },

        {
          pageNumber: 4,
          sections: [
            {
              title: "Undergarments (optional)",
              questions: [
                {
                  id: uuid(),
                  label: "Bra Size:",
                  type: "select",
                  value: "",
                  options: [
                    { value: "xs", label: "XS" },
                    { value: "s", label: "S" },
                    { value: "m", label: "M" },
                    { value: "l", label: "L" },
                    { value: "xl", label: "XL" },
                    { value: "xxl", label: "XXL" },
                  ],
                },
                {
                  id: uuid(),
                  label: "Underwear Size:",
                  type: "select",
                  value: "",
                  options: [
                    { value: "xs", label: "XS" },
                    { value: "s", label: "S" },
                    { value: "m", label: "M" },
                    { value: "l", label: "L" },
                    { value: "xl", label: "XL" },
                    { value: "xxl", label: "XXL" },
                  ],
                },
                {
                  id: uuid(),
                  label: "Shape-wear or Layering Preferences:",
                  type: "select",
                  value: "",
                  options: [
                    { value: "normal", label: "Normal Fit" },
                    { value: "tight", label: "Tight Fit" },
                    { value: "loose", label: "Loose Fit" },
                  ],
                },
              ],
            },
            {
              title: "Accessories & Extras",
              questions: [
                {
                  id: uuid(),
                  label: "Glove Size:",
                  type: "select",
                  value: "",
                  options: [
                    { value: "normal", label: "Normal Fit" },
                    { value: "tight", label: "Tight Fit" },
                    { value: "loose", label: "Loose Fit" },
                  ],
                },
                {
                  id: uuid(),
                  label: "Ring Size:",
                  type: "number",
                  value: "",
                },
                {
                  id: uuid(),
                  label: "Preferred Fabrics / Fit Notes:",
                  type: "select",
                  value: "",
                  options: [
                    { value: "normal", label: "Normal Fit" },
                    { value: "tight", label: "Tight Fit" },
                    { value: "loose", label: "Loose Fit" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    {
      id: uuid(),
      name: "Fashion",
      part: 2,
      pages: [
        {
          pageNumber: 1,
          sections: [
            {
              title: "1. What is your personal fashion style or aesthetic?",
              questions: [
                {
                  id: uuid(),
                  label: "Luxury / High Fashion",
                  type: "checkbox",
                  value: "luxury",
                  checked: false,
                },
                {
                  id: uuid(),
                  label: "Streetwear",
                  type: "checkbox",
                  value: "streetwear",
                  checked: false,
                },
                {
                  id: uuid(),
                  label: "Minimalist",
                  type: "checkbox",
                  value: "minimalist",
                  checked: false,
                },
                {
                  id: uuid(),
                  label: "Avant-Garde",
                  type: "checkbox",
                  value: "avant-garde",
                  checked: false,
                },
                {
                  id: uuid(),
                  label: "Eclectic / Experimental",
                  type: "checkbox",
                  value: "eclectic",
                  checked: false,
                },
                {
                  id: uuid(),
                  label: "Sustainable / Ethical",
                  type: "checkbox",
                  value: "sustainable",
                  checked: false,
                },
                {
                  id: uuid(),
                  label: "Bohemian",
                  type: "checkbox",
                  value: "bohemian",
                  checked: false,
                },
                {
                  id: uuid(),
                  label: "Gender-neutral / Androgynous",
                  type: "checkbox",
                  value: "gender-neutral",
                  checked: false,
                },
              ],
            },
            {
              title: "2. Have you worked with any fashion brands?",
              questions: [
                {
                  id: uuid(),
                  type: "radio",
                  name: "fashion_brands",
                  value: "",
                  options: [
                    {
                      value: "yes_international",
                      label: "Yes, international brands",
                    },
                    {
                      value: "yes_regional",
                      label: "Yes, regional/local brands",
                    },
                    {
                      value: "yes_independent",
                      label: "Yes, independent/emerging ",
                    },
                    {
                      value: "no",
                      label: "No, not yet",
                    },
                    {
                      value: "own_fashion_brand",
                      label: "I’ve created my own fashion brand",
                    },
                  ],
                },
              ],
            },
            {
              title:
                "3. Do you have experience in runway, editorial, or digital fashion?",
              questions: [
                {
                  id: uuid(),
                  label: "Luxury / High Fashion",
                  type: "checkbox",
                  value: "luxury",
                  checked: false,
                },
                {
                  id: uuid(),
                  label: "Streetwear",
                  type: "checkbox",
                  value: "streetwear",
                  checked: false,
                },
                {
                  id: uuid(),
                  label: "Minimalist",
                  type: "checkbox",
                  value: "minimalist",
                  checked: false,
                },
                {
                  id: uuid(),
                  label: "Avant-Garde",
                  type: "checkbox",
                  value: "avant-garde",
                  checked: false,
                },
                {
                  id: uuid(),
                  label: "Eclectic / Experimental",
                  type: "checkbox",
                  value: "eclectic",
                  checked: false,
                },
                {
                  id: uuid(),
                  label: "Sustainable / Ethical",
                  type: "checkbox",
                  value: "sustainable",
                  checked: false,
                },
                {
                  id: uuid(),
                  label: "Bohemian",
                  type: "checkbox",
                  value: "bohemian",
                  checked: false,
                },
                {
                  id: uuid(),
                  label: "Gender-neutral / Androgynous",
                  type: "checkbox",
                  value: "gender-neutral",
                  checked: false,
                },
              ],
            },
          ],
        },

        {
          pageNumber: 2,
          sections: [
            {
              title: "4. Have you participated in any Fashion Week events?",
              questions: [
                {
                  id: uuid(),
                  type: "radio",
                  name: "fashion_week",
                  value: "",
                  options: [
                    {
                      value: "yes_major_cities",
                      label: "Yes – Major cities (Paris, Milan, NY, London)",
                    },
                    {
                      value: "yes_regional",
                      label: "Yes, regional/local brands",
                    },
                    {
                      value: "no",
                      label: "No, not yet",
                    },
                    {
                      value: "attended",
                      label: "I’ve attended, not walked",
                    },
                    {
                      value: "featured",
                      label: "I’ve been featured in presentations or events",
                    },
                  ],
                },
              ],
            },
            {
              title:
                "5. Are you open to collaborations with emerging designers or brands?",
              questions: [
                {
                  id: uuid(),
                  type: "radio",
                  name: "collaboration",
                  value: "",
                  options: [
                    {
                      value: "yes_absolutely",
                      label: "Yes, absolutely",
                    },
                    {
                      value: "maybe",
                      label: "Maybe, depending on alignment",
                    },
                    {
                      value: "established",
                      label: "Only with established or vetted brands",
                    },
                    {
                      value: "no",
                      label: "No, currently not seeking collaborations",
                    },
                  ],
                },
              ],
            },
            {
              title:
                "6. Do you have your own fashion line or plan to create one?",
              questions: [
                {
                  id: uuid(),
                  type: "radio",
                  name: "fashion_line",
                  value: "",
                  options: [
                    {
                      value: "yes_currently",
                      label: "Yes – Currently active",
                    },
                    {
                      value: "yes_development",
                      label: "Yes – In development",
                    },
                    {
                      value: "no_but_planning",
                      label: "No – But planning to",
                    },
                    {
                      value: "no",
                      label: "No – Not at the moment",
                    },
                  ],
                },
              ],
            },
            {
              title: "7. Which niche best represents your fashion involvement?",
              questions: [
                {
                  id: uuid(),
                  type: "checkbox",
                  label: "High Fashion / Couture",
                  value: "high_fashion",
                  checked: false,
                },
                {
                  id: uuid(),
                  type: "checkbox",
                  label: "Streetwear",
                  value: "streetwear",
                  checked: false,
                },
                {
                  id: uuid(),
                  type: "checkbox",
                  label: "Sustainable Fashion",
                  value: "sustainable_fashion",
                  checked: false,
                },
                {
                  id: uuid(),
                  type: "checkbox",
                  label: "Avant-Garde / Conceptual",
                  value: "avant-garde",
                  checked: false,
                },
                {
                  id: uuid(),
                  type: "checkbox",
                  label: "Commercial / Retail",
                  value: "commercial",
                  checked: false,
                },
                {
                  id: uuid(),
                  type: "checkbox",
                  label: "Adaptive / Inclusive fashion",
                  value: "adaptive",
                  checked: false,
                },
              ],
            },
          ],
        },

        {
          pageNumber: 3,
          sections: [
            {
              title: "8. Have you been featured in fashion publications?",
              questions: [
                {
                  id: uuid(),
                  type: "radio",
                  name: "publications",
                  value: "",
                  options: [
                    {
                      value: "yes_international",
                      label: "Yes – International (Vogue, GQ, Elle, etc.)",
                    },
                    {
                      value: "yes_national",
                      label: "Yes – National/Regional",
                    },
                    {
                      value: "yes_digital",
                      label: "Yes – Digital platforms or blogs",
                    },
                    {
                      value: "no",
                      label: "No – Not yet",
                    },
                    {
                      value: "featured",
                      label:
                        "I’ve been featured in brand lookbooks or campaigns",
                    },
                  ],
                },
              ],
            },
            {
              title:
                "9. Are you interested in roles beyond fashion modeling (e.g., styling or consulting)?",
              questions: [
                {
                  id: uuid(),
                  type: "radio",
                  name: "roles",
                  value: "",
                  options: [
                    {
                      value: "yes_styling",
                      label: "Yes – Styling",
                    },
                    {
                      value: "yes_creative",
                      label: "Yes – Creative Direction",
                    },
                    {
                      value: "yes_brand",
                      label: "Yes – Brand Consulting",
                    },
                    {
                      value: "no",
                      label: "No – Focused on modeling only",
                    },
                    {
                      value: "possibly",
                      label: "Possibly – Open to discussion",
                    },
                  ],
                },
              ],
            },
            {
              title:
                "10. Do you have experience with fashion-related events, panels, or campaigns?",
              questions: [
                {
                  id: uuid(),
                  type: "radio",
                  name: "open_to_brands",
                  value: "",
                  options: [
                    {
                      value: "yes_public",
                      label: "Yes – Public speaking or panels",
                    },
                    {
                      value: "yes_brand",
                      label: "Yes – Brand campaigns",
                    },
                    {
                      value: "yes_events",
                      label: "Yes – Live events or launch parties",
                    },
                    {
                      value: "no",
                      label: "No – Not yet",
                    },
                    {
                      value: "hosted",
                      label: "I’ve hosted or curated fashion events",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  setAnswer: ({ questionId, value }) =>
    set((state) => {
      const updatedForms = state.forms.map((form) => ({
        ...form,
        pages: form.pages.map((page) => ({
          ...page,
          sections: page.sections.map((section) => ({
            ...section,
            questions: section.questions.map((question) => {
              if (question.id === questionId) {
                if (question.type === "checkbox") {
                  return {
                    ...question,
                    checked: !question.checked,
                  };
                }
                return {
                  ...question,
                  value: value,
                };
              }
              return question;
            }),
          })),
        })),
      }));

      return { forms: updatedForms };
    }),
}));

export default useQuestionnaireStore;
