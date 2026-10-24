import { fireEvent, render as renderBrut, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { modeleParId } from '@/exercices';

import { JeuBonFil } from '../JeuBonFil';
import { JeuMarche } from '../JeuMarche';
import { JeuReponses } from '../JeuReponses';

const render = (ui: ReactElement) => renderBrut(<GestureHandlerRootView>{ui}</GestureHandlerRootView>);

const groupements = modeleParId('groupements')!;
const retrait = modeleParId('retrait')!;

// 3 paniers de 4 fraises, histoire du marché.
function exerciceMarche() {
  for (let graine = 0; ; graine++) {
    const ex = groupements.generer('CE2', graine, { histoire: 0 });
    if (ex.donnees.groupes === 3 && ex.donnees.parGroupe === 4) return ex;
  }
}

describe('Le marché', () => {
  it('construit la réponse en touchant les paniers, puis valide', async () => {
    const onRepondre = jest.fn();
    await render(<JeuMarche exercice={exerciceMarche()} actif onRepondre={onRepondre} />);
    for (let panier = 1; panier <= 3; panier++) {
      for (let k = 0; k < 4; k++) {
        await fireEvent.press(screen.getByLabelText(new RegExp(`^Panier ${panier},`)));
      }
    }
    expect(screen.getByText(/Dans les paniers : 12 fraises/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(onRepondre).toHaveBeenCalledWith(true);
  });

  it('signale une réponse différente, et permet de retirer une fraise', async () => {
    const onRepondre = jest.fn();
    await render(<JeuMarche exercice={exerciceMarche()} actif onRepondre={onRepondre} />);
    await fireEvent.press(screen.getByLabelText(/^Panier 1,/));
    await fireEvent.press(screen.getByLabelText(/^Panier 1,/));
    await fireEvent.press(screen.getByLabelText('Retirer une fraise du panier 1'));
    expect(screen.getByText(/Dans les paniers : 1 fraise$/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(onRepondre).toHaveBeenCalledWith(false);
  });
});

describe('Le bon fil', () => {
  it('relie l’histoire à la bonne opération', async () => {
    const onRepondre = jest.fn();
    await render(<JeuBonFil exercice={retrait.generer('CE2', 3)} actif onRepondre={onRepondre} />);
    // Les opérations apparaissent une fois la zone mesurée.
    const mesure = (width: number, height: number) => ({ nativeEvent: { layout: { width, height, x: 0, y: 0 } } });
    await fireEvent(screen.getByTestId('zone-bon-fil'), 'layout', mesure(400, 400));
    await fireEvent(screen.getByTestId('histoire-bon-fil'), 'layout', mesure(400, 120));
    await fireEvent.press(screen.getByRole('button', { name: 'Opération plus' }));
    expect(onRepondre).toHaveBeenLastCalledWith(false);
    await fireEvent.press(screen.getByRole('button', { name: 'Opération moins' }));
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });
});

describe('La bonne réponse', () => {
  it('accepte la bonne tuile et refuse les autres', async () => {
    const ex = retrait.generer('CE2', 8);
    const onRepondre = jest.fn();
    await render(<JeuReponses exercice={ex} actif onRepondre={onRepondre} />);
    const mauvaise = ex.choix.find((v) => v !== ex.reponse)!;
    await fireEvent.press(screen.getByRole('button', { name: String(mauvaise) }));
    expect(onRepondre).toHaveBeenLastCalledWith(false);
    await fireEvent.press(screen.getByRole('button', { name: String(ex.reponse) }));
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });

  it('ne réagit plus pendant l’affichage du retour', async () => {
    const ex = retrait.generer('CE2', 8);
    const onRepondre = jest.fn();
    await render(<JeuReponses exercice={ex} actif={false} onRepondre={onRepondre} />);
    await fireEvent.press(screen.getByRole('button', { name: String(ex.reponse) }));
    expect(onRepondre).not.toHaveBeenCalled();
  });
});
