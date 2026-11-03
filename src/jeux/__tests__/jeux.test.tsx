import { fireEvent, render as renderBrut, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { modeleParId, modeleTexteParId } from '@/exercices';
import { schemasAuChoix } from '@/exercices/schemas';

import { JeuBonFil } from '../JeuBonFil';
import { JeuCaisse } from '../JeuCaisse';
import { JeuDictee } from '../JeuDictee';
import { JeuFunambule } from '../JeuFunambule';
import { JeuHorloge } from '../JeuHorloge';
import { JeuImages } from '../JeuImages';
import { JeuLucioles } from '../JeuLucioles';
import { JeuMarche } from '../JeuMarche';
import { JeuOrdre } from '../JeuOrdre';
import { imageMontree, JeuOuiNon } from '../JeuOuiNon';
import { JeuQuestionPerdue } from '../JeuQuestionPerdue';
import { JeuPaniers } from '../JeuPaniers';
import { JeuPassage } from '../JeuPassage';
import { JeuReponses } from '../JeuReponses';
import { JeuSchema } from '../JeuSchema';
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

describe('La phrase en désordre', () => {
  it('reconstruit la phrase mot à mot, et permet de retirer un mot', async () => {
    const ex = modeleTexteParId('phrase-en-ordre')!.generer('CE2', 3);
    const onRepondre = jest.fn();
    await render(<JeuOrdre exercice={ex} actif onRepondre={onRepondre} />);
    const mots = ex.reponse.split(' ');
    // Un mot placé par erreur, puis retiré.
    await fireEvent.press(screen.getByRole('button', { name: `Placer « ${mots[1]} »` }));
    await fireEvent.press(screen.getByRole('button', { name: `Retirer « ${mots[1]} »` }));
    for (const m of mots) await fireEvent.press(screen.getByRole('button', { name: `Placer « ${m} »` }));
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });

  it('signale un autre ordre', async () => {
    const ex = modeleTexteParId('phrase-en-ordre')!.generer('CE2', 3);
    const onRepondre = jest.fn();
    await render(<JeuOrdre exercice={ex} actif onRepondre={onRepondre} />);
    for (const m of ex.motsEnDesordre!) await fireEvent.press(screen.getByRole('button', { name: `Placer « ${m} »` }));
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(onRepondre).toHaveBeenLastCalledWith(false);
  });
});

describe('La caisse', () => {
  it('fait la somme avec des pièces et des billets', async () => {
    const ex = modeleParId('rendre-monnaie')!.generer('CE2', 4, { niveau: 1 });
    const onRepondre = jest.fn();
    await render(<JeuCaisse exercice={ex} actif onRepondre={onRepondre} />);
    // Une pièce de 2 € posée puis retirée.
    await fireEvent.press(screen.getByRole('button', { name: 'Poser une pièce de 2 €' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Retirer 2 €' }));
    for (let i = 0; i < ex.reponse; i++)
      await fireEvent.press(screen.getByRole('button', { name: 'Poser une pièce de 1 €' }));
    expect(screen.getByText(`Sur le plateau : ${ex.reponse} €`)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });
});

describe('L’horloge', () => {
  it('part de l’heure de début et avance jusqu’à l’heure de fin', async () => {
    const ex = modeleParId('duree')!.generer('CE2', 8, { niveau: 2 });
    const onRepondre = jest.fn();
    await render(<JeuHorloge exercice={ex} actif onRepondre={onRepondre} />);
    expect(screen.getByLabelText(`L’horloge indique ${ex.donnees.debut} heures.`)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(onRepondre).toHaveBeenLastCalledWith(false);
    for (let i = 0; i < ex.donnees.duree; i++)
      await fireEvent.press(screen.getByRole('button', { name: 'Avancer d’une heure' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }));
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });
});

describe('Les images', () => {
  it('accepte la bonne image ; le lecteur d’écran ne dit pas ce qu’elle montre', async () => {
    const ex = modeleTexteParId('comprendre-mot')!.generer('CP', 5);
    const onRepondre = jest.fn();
    await render(<JeuImages exercice={ex} actif onRepondre={onRepondre} />);
    const rang = ex.choix.indexOf(ex.reponse) + 1;
    expect(screen.queryByRole('button', { name: ex.reponse })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: `Image ${rang === 1 ? 2 : 1}` }));
    expect(onRepondre).toHaveBeenLastCalledWith(false);
    await fireEvent.press(screen.getByRole('button', { name: `Image ${rang}` }));
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });

  it('dessine une scène par choix pour les phrases', async () => {
    const ex = modeleTexteParId('comprendre-phrase')!.generer('CE1', 3);
    await render(<JeuImages exercice={ex} actif onRepondre={jest.fn()} />);
    expect(screen.getAllByRole('button', { name: /^Image \d$/ })).toHaveLength(ex.choix.length);
    expect(screen.getByRole('button', { name: 'Réécouter la phrase' })).toBeTruthy();
  });
});

describe('C’est bien ça ?', () => {
  it('montre la bonne image une fois sur deux, et attend « Oui » ou « Non »', async () => {
    const tirages = Array.from({ length: 200 }, (_, g) => modeleTexteParId('comprendre-phrase')!.generer('CP', g));
    const justes = tirages.filter((ex) => imageMontree(ex).juste).length;
    expect(justes).toBeGreaterThan(70);
    expect(justes).toBeLessThan(130);

    // Une image qui ne va pas avec la phrase : la bonne réponse est « Non ».
    const ex = tirages.find((e) => !imageMontree(e).juste)!;
    const onRepondre = jest.fn();
    await render(<JeuOuiNon exercice={ex} actif onRepondre={onRepondre} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Oui' }));
    expect(onRepondre).toHaveBeenLastCalledWith(false);
    await fireEvent.press(screen.getByRole('button', { name: 'Non' }));
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });
});

describe('Le bon schéma', () => {
  it('accepte le schéma qui raconte l’histoire', async () => {
    const ex = retrait.generer('CE2', 8);
    const { bon } = schemasAuChoix(ex)!;
    const onRepondre = jest.fn();
    await render(<JeuSchema exercice={ex} actif onRepondre={onRepondre} />);
    await fireEvent.press(screen.getByRole('button', { name: new RegExp(`^Schéma ${bon === 0 ? 2 : 1}\\.`) }));
    expect(onRepondre).toHaveBeenLastCalledWith(false);
    await fireEvent.press(screen.getByRole('button', { name: new RegExp(`^Schéma ${bon + 1}\\.`) }));
    expect(onRepondre).toHaveBeenLastCalledWith(true);
  });
});
