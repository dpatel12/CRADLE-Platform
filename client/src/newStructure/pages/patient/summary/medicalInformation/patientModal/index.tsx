import { Action, actionCreators } from '../../reducers';
import { EditedPatient, OrNull } from '@types';
import { Form, InputOnChangeData } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';

import Button from '@material-ui/core/Button';
import { Dialog } from '../../../../../shared/components/dialog';
import { PatientInfoForm } from '../../../../../shared/components/form/patient';
import React from 'react';
import { ReduxState } from '../../../../../redux/reducers';
import { Toast } from '../../../../../shared/components/toast';
import { clearUpdatePatientRequestOutcome } from '../../../../../redux/reducers/patients';
import { useDisableSubmit } from './hooks/disableSubmit';
import { useStyles } from './styles';
import { useSubmit } from './hooks/submit';

interface IProps {
  displayPatientModal: boolean;
  patient: EditedPatient;
  updateState: React.Dispatch<Action>;
}

type SelectorState = {
  error: OrNull<string>;
  loading: boolean;
  success: OrNull<string>;
};

export const PatientModal: React.FC<IProps> = ({
  displayPatientModal,
  patient,
  updateState,
}) => {
  const classes = useStyles();

  const { loading, error, success } = useSelector(
    ({ patients }: ReduxState): SelectorState => ({
      error: patients.error,
      loading: patients.isLoading,
      success: patients.success,
    })
  );

  const dispatch = useDispatch();

  const closePatientModal = (): void => {
    updateState(actionCreators.closePatientModal());
  };

  const handleChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { name, value }: InputOnChangeData
  ): void => {
    updateState(actionCreators.editPatient({ name, value }));
  };

  const disabled = useDisableSubmit({ loading, editedPatient: patient });

  const handleEditedPatientSubmit = useSubmit({
    displayPatientModal,
    editedPatient: patient,
  });

  const clearMessage = (): void => {
    dispatch(clearUpdatePatientRequestOutcome());
  };

  return (
    <>
      <Toast
        clickaway={!error}
        message={success || error}
        status={error ? `error` : `success`}
        clearMessage={clearMessage}
      />
      <Dialog
        open={displayPatientModal}
        onClose={closePatientModal}
        aria-labelledby="edit-patient-dialog-title"
        content={
          <Form onSubmit={handleEditedPatientSubmit}>
            <PatientInfoForm patient={patient} onChange={handleChange} />
            <Button
              className={classes.submit}
              disabled={disabled}
              type="submit"
              variant="contained">
              Submit
            </Button>
          </Form>
        }
        title={`Patient Information for ID #${patient.patientId}`}
        subtitle="Fields marked with * are required"
      />
    </>
  );
};
