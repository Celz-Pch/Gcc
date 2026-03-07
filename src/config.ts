export interface Subject {
    name: string
    description: string
    files: string[]
}

export interface Session {
    title: string
    date: string
    location: string
    description: string
}

export const session: Session = {
    title: 'Coding Club',
    date: 'Samedi 8 Mars 2026',
    location: 'Epitech — Le Hub',
    description: 'Bienvenue au Coding Club ! Retrouvez ici les ressources et sujets de la session.'
}

export const subjects: Subject[] = [
    {
        name: 'Mycépaint',
        description: 'Projet Python/Pygame consistant à créer un logiciel de dessin. Au service du roi Weegee, vous développez une application permettant de tracer des lignes à la souris, de remplir des zones avec de la couleur (bucket fill) et d\'effacer le canvas. Le projet introduit la gestion de fenêtre, la boucle d\'événements, la détection des entrées souris/clavier et les fonctions de dessin de Pygame.',
        files: ['Mycepaint_2026.pdf']
    },
    {
        name: 'PokeClicker',
        description: 'Projet Python/Pygame consistant à créer un logiciel de dessin. Au service du roi Weegee, vous développez une application permettant de tracer des lignes à la souris, de remplir des zones avec de la couleur (bucket fill) et d\'effacer le canvas. Le projet introduit la gestion de fenêtre, la boucle d\'événements, la détection des entrées souris/clavier et les fonctions de dessin de Pygame.',
        files: ['Paperclip_Factory.pdf']
    }
]
