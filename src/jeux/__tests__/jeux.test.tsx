import { fireEvent, render as renderBrut, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { modeleParId, modeleTexteParId } from '@/exercices';

import { JeuBonFil } from '../JeuBonFil';
import { JeuDictee } from '../JeuDictee';
import { JeuFunambule } from '../JeuFunambule';
import { JeuLucioles } from '../JeuLucioles';
import { JeuMarche } from '../JeuMarche';
import { JeuQuestionPerdue } from '../JeuQuestionPerdue';
import { JeuPaniers } from '../JeuPaniers';
import { JeuPassage } from '../JeuPassage';
import { JeuReponses } from '../JeuReponses';
import { JeuWagons } from '../JeuWagons';

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

describe('Les wagons de la phrase', () => {
  it('accepte le bon wagon et refuse les autres', async () => {
    const ex = modeleTexteParId('sujet-et-verbe')!.generer('CE2', 5);
    const onRepondre = jest.fn();
    await render(<JeuWagons exercice={ex} actif onRepondre={onRepondre} />);
    const autre = ex.segments!.find((s) => s.texte !== ex.reponse)!.texte;
    await fireEvent.press(screen.getByRole('button', { name: autre }));
    expect(onRepondre).toHaveBeenLastCalledWith(false);
    await fireEvent.press(screen.getByRole('button', { name: ex.reponse }));
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });
});

describe('Les paniers', () => {
  it('range le mot en couleur dans le bon panier', async () => {
    const ex = modeleTexteParId('nature-du-mot')!.generer('CE2', 8);
    const onRepondre = jest.fn();
    await render(<JeuPaniers exercice={ex} actif onRepondre={onRepondre} />);
    const autre = ex.categories!.find((c) => c !== ex.reponse)!;
    await fireEvent.press(screen.getByRole('button', { name: new RegExp(`^Panier ${autre}`) }));
    expect(onRepondre).toHaveBeenLastCalledWith(false);
    await fireEvent.press(screen.getByRole('button', { name: new RegExp(`^Panier ${ex.reponse}`) }));
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });
});

describe('Attrape-lucioles avec des mots', () => {
  it('accepte la luciole qui porte la bonne forme du verbe', async () => {
    const ex = modeleTexteParId('conjugaison-futur')!.generer('CE2', 12);
    const onRepondre = jest.fn();
    await render(<JeuLucioles exercice={ex} actif onRepondre={onRepondre} />);
    await fireEvent.press(screen.getByRole('button', { name: `Luciole ${ex.reponse}` }));
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });
});

describe('La dictée de Capy', () => {
  const dictee = () => modeleTexteParId('dictee-mots')!.generer('CE2', 5, { niveau: 1 });

  it('accepte le mot bien écrit, accents ajoutés avec les touches', async () => {
    const ex = dictee();
    const onRepondre = jest.fn();
    await render(<JeuDictee exercice={ex} actif onRepondre={onRepondre} />);
    expect(screen.queryByText(new RegExp(`\b${ex.reponse}\b`))).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Le mot que tu as écrit'), ex.reponse.toUpperCase());
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(onRepondre).toHaveBeenCalledWith(true);
  });

  it('donne un conseil quand le mot n’est pas encore bien écrit', async () => {
    const onRepondre = jest.fn();
    const ex = dictee();
    await render(<JeuDictee exercice={ex} actif onRepondre={onRepondre} />);
    await fireEvent.changeText(screen.getByLabelText('Le mot que tu as écrit'), ex.reponse.slice(0, -1));
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(onRepondre).toHaveBeenCalledWith(false);
    expect(screen.getByText('Il manque une lettre.')).toBeTruthy();
  });

  it('ajoute une lettre accentuée à la suite de ce qui est écrit', async () => {
    await render(<JeuDictee exercice={dictee()} actif onRepondre={jest.fn()} />);
    await fireEvent.press(screen.getByLabelText('Ajouter é'));
    expect(screen.getByLabelText('Le mot que tu as écrit').props.value).toBe('é');
    await fireEvent.changeText(screen.getByLabelText('Le mot que tu as écrit'), 'mét');
    await fireEvent.press(screen.getByLabelText('Ajouter é'));
    expect(screen.getByLabelText('Le mot que tu as écrit').props.value).toBe('mété');
  });
});

describe('La bonne phrase', () => {
  const ex = () => modeleTexteParId('preuve-texte')!.generer('CE2', 3, { niveau: 2 });

  it('accepte la phrase qui répond à la consigne', async () => {
    const e = ex();
    const onRepondre = jest.fn();
    await render(<JeuPassage exercice={e} actif onRepondre={onRepondre} />);
    await fireEvent.press(screen.getByRole('button', { name: e.reponse }));
    expect(onRepondre).toHaveBeenCalledWith(true);
  });

  it('signale une autre phrase sans la juger', async () => {
    const e = ex();
    const onRepondre = jest.fn();
    await render(<JeuPassage exercice={e} actif onRepondre={onRepondre} />);
    await fireEvent.press(screen.getByRole('button', { name: e.phrases!.find((p) => p !== e.reponse)! }));
    expect(onRepondre).toHaveBeenCalledWith(false);
  });
});
