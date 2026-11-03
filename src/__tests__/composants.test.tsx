import { fireEvent, render, screen } from '@testing-library/react-native';

import { Bouton } from '@/composants/Bouton';
import { PanneauRetour } from '@/composants/PanneauRetour';
import { PoserCalcul } from '@/composants/PoserCalcul';

describe('Bouton', () => {
  it('réagit à l’appui', async () => {
    const onPress = jest.fn();
    await render(<Bouton titre="Lancer le parcours" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Lancer le parcours' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ne réagit pas quand il est désactivé', async () => {
    const onPress = jest.fn();
    await render(<Bouton titre="Créer le profil" desactive onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Créer le profil' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('PanneauRetour', () => {
  it('après une erreur : « Presque ! », un indice et « Réessayer », jamais « faux »', async () => {
    const onContinuer = jest.fn();
    await render(
      <PanneauRetour
        type="presque"
        indice="Combien de fraises dans chaque paquet ?"
        explication="4 × 6 = 24"
        onContinuer={onContinuer}
      />,
    );
    expect(screen.getByText('Presque !')).toBeTruthy();
    expect(screen.getByText('Combien de fraises dans chaque paquet ?')).toBeTruthy();
    expect(screen.queryByText(/faux/i)).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Réessayer' }));
    expect(onContinuer).toHaveBeenCalled();
  });

  it('après une bonne réponse : « Bravo ! » et « Continuer »', async () => {
    await render(<PanneauRetour type="bravo" explication="4 × 6 = 24" onContinuer={() => {}} />);
    expect(screen.getByText('Bravo !')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeTruthy();
  });

  it('après plusieurs essais : annonce le choix réduit, puis montre la méthode', async () => {
    const { rerender } = await render(
      <PanneauRetour type="presque" indice="Relis l’histoire." choixReduits onContinuer={() => {}} />,
    );
    expect(screen.getByText('Capy a enlevé des réponses pour t’aider.')).toBeTruthy();
    await rerender(
      <PanneauRetour type="presque" indice="Relis l’histoire." methode="4 × 6 = 24" onContinuer={() => {}} />,
    );
    expect(screen.getByText('Regarde comment on fait :')).toBeTruthy();
    expect(screen.getByText('4 × 6 = 24')).toBeTruthy();
    expect(screen.queryByText('Relis l’histoire.')).toBeNull();
  });
});

describe('PoserCalcul', () => {
  it('pose le calcul de l’histoire, puis vérifie le résultat écrit de droite à gauche', async () => {
    await render(<PoserCalcul />);
    await fireEvent.press(screen.getByRole('button', { name: 'addition' }));
    await fireEvent.changeText(screen.getByLabelText('Le premier nombre'), '47');
    await fireEvent.changeText(screen.getByLabelText('Le second nombre'), '25');
    await fireEvent.press(screen.getByRole('button', { name: 'Poser en colonnes' }));
    // La case des unités du résultat est choisie au départ ; on écrit 2, puis 7 à sa gauche.
    await fireEvent.press(screen.getByRole('button', { name: 'Écrire 2' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Écrire 6' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Vérifier mon calcul' }));
    expect(screen.getByText(/Regarde les cases en orange/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Résultat, dizaines : 6, à revoir' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Écrire 7' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Vérifier mon calcul' }));
    expect(screen.getByText(/Ton calcul est juste/)).toBeTruthy();
  });

  it('refuse une soustraction posée à l’envers', async () => {
    await render(<PoserCalcul />);
    await fireEvent.press(screen.getByRole('button', { name: 'soustraction' }));
    await fireEvent.changeText(screen.getByLabelText('Le premier nombre'), '12');
    await fireEvent.changeText(screen.getByLabelText('Le second nombre'), '30');
    await fireEvent.press(screen.getByRole('button', { name: 'Poser en colonnes' }));
    expect(screen.getByText(/le plus grand nombre se met en haut/)).toBeTruthy();
  });

  it('s’ouvre déjà posé en « Poser et calculer », sans bouton de vérification', async () => {
    await render(<PoserCalcul donnee={{ operation: '×', a: 234, b: 56 }} verification={false} />);
    expect(screen.getAllByRole('button', { name: /^Ligne 2,/ })).toHaveLength(4);
    expect(screen.queryByRole('button', { name: 'Vérifier mon calcul' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Changer le calcul' })).toBeNull();
  });
});
