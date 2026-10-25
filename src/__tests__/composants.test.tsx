import { fireEvent, render, screen } from '@testing-library/react-native';

import { Bouton } from '@/composants/Bouton';
import { PanneauRetour } from '@/composants/PanneauRetour';

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
