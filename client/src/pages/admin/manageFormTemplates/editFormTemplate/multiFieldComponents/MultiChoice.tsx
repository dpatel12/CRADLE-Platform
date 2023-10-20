import { FormLabel, Grid, IconButton, Tooltip } from '@mui/material';
import { PrimaryButton } from '../../../../../shared/components/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Dispatch, SetStateAction } from 'react';

interface IProps {
  numChoices: number;
  inputLanguages: string[];
  fieldChanged: boolean;
  handleAddChoice: () => void;
  setFieldChanged: Dispatch<SetStateAction<boolean>>;
  setFormDirty: Dispatch<SetStateAction<boolean>>;
  handleMultiChoiceOptionChange: (
    language: string,
    option: string,
    index: number
  ) => void;
  handleRemoveMultiChoice: (index: number) => void;
  getMcOptionValue: (language: string, index: number) => string;
}

const MultiChoice = ({
  numChoices,
  inputLanguages,
  fieldChanged,
  handleAddChoice,
  setFieldChanged,
  setFormDirty,
  handleMultiChoiceOptionChange,
  handleRemoveMultiChoice,
  getMcOptionValue,
}: IProps) => {
  return (
    <Grid item container spacing={3}>
      <Grid item xs={12}>
        <PrimaryButton
          type="button"
          onClick={(e) => {
            handleAddChoice();
            setFieldChanged(!fieldChanged);
            setFormDirty(true);
          }}>
          {'Add Option'}
        </PrimaryButton>
      </Grid>
      <Grid item container spacing={3}>
        {Array.from(Array(numChoices).keys()).map((_, index) => (
          <Grid item xs={12} key={`option-${index}`}>
            <Grid
              item
              container
              xs={12}
              sm={6}
              md={4}
              lg={3}
              justifyContent="space-between">
              <FormLabel id="field-type-label" style={{ paddingBottom: '8px' }}>
                <Typography variant="h6">Option {index + 1}</Typography>
              </FormLabel>

              <Tooltip
                disableFocusListener
                disableTouchListener
                title={'Delete field'}
                placement="right"
                arrow>
                <IconButton
                  key={`remove-option-${index + 1}`}
                  color="error"
                  style={{ padding: '0px' }}
                  onClick={(e) => {
                    handleRemoveMultiChoice(index);
                    setFieldChanged(!fieldChanged);
                    setFormDirty(true);
                  }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Grid>

            <Grid item container>
              {inputLanguages.map((lang) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={`${lang}-mult-choice-option-${index + 1}-body`}>
                  <TextField
                    key={`${lang}-field-name-mult-choice-option-${index + 1}`}
                    label={`${lang} Option ${index + 1}`}
                    required={true}
                    variant="outlined"
                    value={getMcOptionValue(lang, index)}
                    fullWidth
                    multiline
                    size="small"
                    inputProps={{
                      // TODO: Determine what types of input restrictions we should have for multiple choice option
                      maxLength: Number.MAX_SAFE_INTEGER,
                    }}
                    onChange={(e) => {
                      handleMultiChoiceOptionChange(
                        lang,
                        e.target.value,
                        index
                      );
                      setFieldChanged(!fieldChanged);
                      setFormDirty(true);
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default MultiChoice;
