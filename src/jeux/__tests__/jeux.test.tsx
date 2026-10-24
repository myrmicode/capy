import { fireEvent, render as renderBrut, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { modeleParId } from '@/exercices';

import { JeuBonFil } from '../JeuBonFil';
import { JeuFunambule } from '../JeuFunambule';
import { JeuLucioles } from '../JeuLucioles';
import { JeuMarche } from '../JeuMarche';
import { JeuQuestionPerdue } from '../JeuQuestionPerdue';
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

describe('Attrape-lucioles', () => {
  it('accepte la luciole qui porte la bonne réponse', async () => {
    const ex = modeleParId('tables')!.generer('CE2', 4);
    const onRepondre = jest.fn();
    await render(<JeuLucioles exercice={ex} actif onRepondre={onRepondre} />);
    const mauvaise = ex.choix.find((v) => v !== ex.reponse)!;
    await fireEvent.press(screen.getByRole('button', { name: `Luciole ${mauvaise}` }));
    expect(onRepondre).toHaveBeenLastCalledWith(false);
    await fireEvent.press(screen.getByRole('button', { name: `Luciole ${ex.reponse}` }));
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });
});

describe('La question perdue', () => {
  it('reconnaît la question qui va avec l’histoire', async () => {
    const ex = modeleParId('retrait')!.generer('CE2', 2);
    const onRepondre = jest.fn();
    await render(<JeuQuestionPerdue exercice={ex} actif onRepondre={onRepondre} />);
    // La question n'est pas affichée avec l'histoire : elle fait partie des choix.
    expect(screen.getAllByText(ex.question)).toHaveLength(1);
    const leurre = ex.questionsAuChoix!.find((q) => q !== ex.question)!;
    await fireEvent.press(screen.getByRole('button', { name: leurre }));
    expect(onRepondre).toHaveBeenLastCalledWith(false);
    await fireEvent.press(screen.getByRole('button', { name: ex.question }));
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });
});

describe('Le funambule', () => {
  it('fait avancer Capy de graduation en graduation jusqu’au bon nombre', async () => {
    const ex = modeleParId('placer-grands-pas')!.generer('CE2', 9);
    const rang = (ex.reponse - ex.donnees.debut) / ex.donnees.pas;
    const onRepondre = jest.fn();
    await render(<JeuFunambule exercice={ex} actif onRepondre={onRepondre} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(onRepondre).toHaveBeenLastCalledWith(false);
    for (let i = 0; i < rang; i++) {
      await fireEvent.press(screen.getByRole('button', { name: 'Avancer d’une graduation' }));
    }
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });
});
