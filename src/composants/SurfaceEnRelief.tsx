import type { ReactNode } from 'react';
import { Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

export interface PropsSurfaceEnRelief extends Omit<PressableProps, 'children' | 'style'> {
  couleurFace: string;
  couleurRelief: string;
  /** Épaisseur du relief en pixels ; il disparaît à l'appui et la face descend d'autant. */
  relief: number;
  rayon: number;
  couleurBordure?: string;
  epaisseurBordure?: number;
  style?: StyleProp<ViewStyle>;
  styleFace?: StyleProp<ViewStyle>;
  children: ReactNode | ((appuye: boolean) => ReactNode);
}

/**
 * Brique commune des boutons, tuiles et étapes : une face posée sur un bord
 * inférieur plus foncé. Pas d'ombre portée, pas de dégradé.
 */
export function SurfaceEnRelief({
  couleurFace,
  couleurRelief,
  relief,
  rayon,
  couleurBordure,
  epaisseurBordure = 2,
  style,
  styleFace,
  disabled,
  children,
  ...props
}: PropsSurfaceEnRelief) {
  return (
    <Pressable disabled={disabled} style={style} {...props}>
      {({ pressed }) => {
        const enfonce = pressed && !disabled;
        return (
          <View
            style={{
              backgroundColor: couleurRelief,
              borderRadius: rayon,
              paddingBottom: enfonce ? 0 : relief,
              marginTop: enfonce ? relief : 0,
              flexGrow: 1,
            }}
          >
            <View
              style={[
                {
                  backgroundColor: couleurFace,
                  borderRadius: rayon,
                  flexGrow: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                couleurBordure ? { borderWidth: epaisseurBordure, borderColor: couleurBordure } : null,
                styleFace,
              ]}
            >
              {typeof children === 'function' ? children(enfonce) : children}
            </View>
          </View>
        );
      }}
    </Pressable>
  );
}
