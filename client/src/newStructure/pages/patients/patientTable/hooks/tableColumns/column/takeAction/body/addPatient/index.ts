import React from 'react';
import { ReduxState } from 'src/newStructure/redux/rootReducer';
import { useSelector } from 'react-redux';

interface IUseAddPatient {
  showAddPatientPrompt: boolean;
  hidePrompt: () => void;
  showPrompt: () => void;
}

export const useAddPatient = (): IUseAddPatient => {
  const error = useSelector(({ patients }: ReduxState): boolean => {
    return Boolean(patients.addingFromGlobalSearchError);
  });

  const [showAddPatientPrompt, setShowAddPatientPrompt] = React.useState<
    boolean
  >(false);

  const hidePrompt = (): void => setShowAddPatientPrompt(false);

  const showPrompt = (): void => setShowAddPatientPrompt(true);

  React.useEffect((): void => {
    if (error) {
      hidePrompt();
    }
  }, [error, hidePrompt]);

  return {
    showAddPatientPrompt,
    hidePrompt,
    showPrompt,
  };
};
