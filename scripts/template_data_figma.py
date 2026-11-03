"""Templates adapted from free Figma Community designs.

Free Community files are published under CC BY 4.0: commercial use is allowed as long as the
original designer is credited. Every entry here keeps a `credit`, shown on the template card
and inside the preview.

These previews are hand-built (public/preview/<slug>/index.html), so `custom: True` tells
build_store_templates.py to list them without overwriting the page.
Before adding one: check the Community page for extra license terms, use only free files,
and keep the original photos from the design (no emoji or cartoon placeholders).
"""

APP_PRODUCT = "app-movil-a-medida"

FIGMA_TEMPLATES = [
    {
        "slug": "aula-app", "name": "Aula", "kind": "app", "sector": "education", "product": APP_PRODUCT, "pair": None, "custom": True,
        "tagline": ["App de clases y cursos", "Classes & courses app"],
        "blurb": ["Tu academia en el teléfono de tus alumnos: clases en vivo, cursos, reservas de horario y chat con el profesor.",
                  "Your academy on your students' phones: live classes, courses, class booking and chat with the teacher."],
        "vars": {"bg": "#ffffff", "text": "#303030", "accent": "#EC5F5F", "accent-ink": "#ffffff", "soft": "#F6F7FA"},
        "credit": {"author": "Zainul Anshor", "url": "https://dribbble.com/zainshr", "work": "Ajheryuk – Live Education",
                   "source": "Figma Community", "license": "CC BY 4.0"},
    },
]
