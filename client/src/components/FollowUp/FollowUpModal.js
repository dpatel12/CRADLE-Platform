/**
 * Description: Modal reponsible for the the UI to create and update
 *      the Follow Up info for Referrals
 * Props:
 *  initialValues [JSON]: initial values of to insert into the form
 *  handleSubmit(state) [required]: function that is called when the user submits form
 *      this function should handle data validation
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
    Button,
    Modal,
    Form,
    TextArea,
    Input, Select
} from 'semantic-ui-react'
import Switch from '@material-ui/core/Switch';

import { updateFollowUp, setReadingId, createFollowUp } from '../../actions/referrals';

const followupFrequencyUnitUnit = [
    {key:'min', text:'Minutes', value:'MINUTES'},
    {key:'hour', text:'Hours', value:'HOURS'},
    {key:'day', text:'Days', value:'DAYS'},
    {key:'week', text:'Weeks', value:'WEEKS'},
    {key:'month', text:'Months', value:'MONTHS'},
    {key:'year', text:'Years', value:'YEARS'},
]

const untilDateOrCondition = [
    {key:'date', text:'Date', value:'DATE'},
    {key:'condition', text:'Condition', value:'CONDITION'}
]


class FollowUpModal extends Component {
    static propTypes = {
        initialValues: PropTypes.objectOf(PropTypes.string),
        updateFollowUp: PropTypes.func.isRequired,
        referralId: PropTypes.string.isRequired,
        readingId: PropTypes.string.isRequired
    }

    constructor(props) {
        super(props)

        this.state = {
            data: {
                followUpAction: "",
                diagnosis: "",
                treatment: "",
                specialInvestigations: "",
                medicationPrescribed: "",
                followupNeeded: false,
                dateFollowupNeededTill: "",
                followupInstruction: "",
                frequencyUnit: "",
                frequencyValue: "",
            },
            isOpen: false,
            dateOrCondition: "date"
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.onOpen = this.onOpen.bind(this);
        this.loadInitialValues = this.loadInitialValues.bind(this);
        this.handleSwitchChange = this.handleSwitchChange.bind(this);

        this.loadInitialValues();
    }

    loadInitialValues() {
        if (this.props.initialValues) {
            for (let key in this.state.data) {
                if (key in this.props.initialValues) {
                    this.state.data[key] = this.props.initialValues[key]
                }
            }
        }
    }

    handleOpen() {
        this.setState({
            isOpen: true
        }, () => {
            this.loadInitialValues();
            this.setState(this.state);
        })
    }

    handleClose() {
        this.setState({
            isOpen: false
        })
    }

    onOpen() {
        console.log("on open")
        this.props.setReadingId(this.props.readingId)
    }

    handleChange(e, value) {
        if (value.name === "untilDateOrCond" && (value.value === "CONDITION" || value.value === "DATE")) {
            this.setState( {dateOrCondition: value.value} )
        }
        this.setState({
            'data': {
                ...this.state.data,
                [value.name]: value.value
            }
        })
    }

    handleSwitchChange(e) {
        this.setState({
            data: {
                ...this.state.data,
                followupNeeded: e.target.checked
            }
        })
    }

    handleDateOrConditionChange = (error, value) => {
        if (value.value === "CONDITION") {
            this.setState({untilDate: false})
        }
    }

    handleSubmit() {
        console.log("submitting follow up info");
        this.state.data.referral = this.props.referralId
        console.log("handle submit state data:  ", this.state.data);

        // update existing followUpInfo
        if (this.props.initialValues) {
            this.props.updateFollowUp(this.props.initialValues['id'], this.state.data);
        } else { // create new followUpInfo
            const followupData = this.state.data;
            // TODO: remove this once mobile is up to date with the new assessment changes
            followupData.followUpAction = followupData.specialInvestigations;

            if (!followupData.followupNeeded) {
                delete followupData.dateFollowupNeededTill;
            }
            this.props.createFollowUp(this.state.data);
        }

        this.handleClose();
    }

    render() {
        // console.log("followUpModal state: ", this.state)
        return (
            <div>
                <Modal
                    trigger={
                        <Button
                            style={{"backgroundColor" : "#84ced4"}}
                            size="large"
                            onClick={this.handleOpen}>
                                {this.props.initialValues ? (
                                    "Update Assessment"
                                ) : (
                                    "Assess"
                                )}
                        </Button>
                    }
                    onClose={this.handleClose}
                    onOpen={this.onOpen}
                    open={this.state.isOpen}
                    closeIcon
                >
                    <Modal.Header>Referral Follow-Up Information</Modal.Header>
                    <Modal.Content scrolling>
                    <Modal.Description>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field
                                name="specialInvestigations"
                                value={this.state.data.specialInvestigations || ''}
                                control={TextArea}
                                label='Special Investigations + Results (If available)'
                                placeholder="Patient's action performed for this follow up"
                                onChange={this.handleChange}
                                required
                            />
                            <Form.Field
                                name="diagnosis"
                                value={this.state.data.diagnosis || ''}
                                control={TextArea}
                                label='Final Diagnosis'
                                placeholder="Medical diagnosis of the cause of their chief complaint"
                                onChange={this.handleChange}
                                required
                            />
                            <Form.Field
                                name="treatment"
                                value={this.state.data.treatment || ''}
                                control={TextArea}
                                label='Treatment/Operation'
                                placeholder="Treatment performed on patient to remedy their chief complaint"
                                onChange={this.handleChange}
                                required
                            />
                            <Form.Field
                                name="medicationPrescribed"
                                value={this.state.data.medicationPrescribed || ''}
                                control={TextArea}
                                label='Medication Prescribed'
                                placeholder="Medication prescribed to patient to remedy their chief complaint"
                                onChange={this.handleChange}
                                required
                            />
                            <Form.Field style={{"margin": "0px"}}>
                                <label style={{"display": "inline-block", "marginRight": "5px"}}>Follow-up Needed</label>
                                <Switch
                                    className='followupNeeded'
                                    checked={this.state.data.followupNeeded}
                                    onChange={this.handleSwitchChange}
                                    color='primary'
                                />
                            </Form.Field>
                            {this.state.data.followupNeeded &&
                            <Form>
                                <Form.Field
                                  name="followupInstructions"
                                  value={this.state.data.followupInstruction || ''}
                                  control={TextArea}
                                  label='Instructions for Follow up'
                                  placeholder="Instruction for VHT to help patient to remedy their chief complaint"
                                  onChange={this.handleChange}
                                  required
                                ></Form.Field>
                                <Form.Group widths='equal'>
                                    <Form.Field
                                      name="frequencyValue"
                                      value={this.state.data.frequencyValue || ''}
                                      control={Input}
                                      type='number'
                                      min='1'
                                      label='Frequency'
                                      placeholder="Frequency"
                                      onChange={this.handleChange}
                                      required
                                    ></Form.Field>
                                    <Form.Field
                                      name="frequencyUnit"
                                      value={this.state.data.frequencyUnit || ''}
                                      control={Select}
                                      options={followupFrequencyUnitUnit}
                                      label='Frequency Unit'
                                      // placeholder="FrequencyUnit for VHT to visit their patient to remedy their chief complaint"
                                      onChange={this.handleChange}
                                      required
                                    ></Form.Field>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Field
                                        name='untilDateOrCond'
                                        value={this.state.dateOrCondition}
                                        control={Select}
                                        options={untilDateOrCondition}
                                        label='Until'
                                        onChange={this.handleChange}
                                        required
                                    ></Form.Field>
                                    <Form.Field
                                      name="dateFollowupNeededTill"
                                      control={Input}
                                      type='date'
                                      label='Until Date'
                                      disabled={this.state.dateOrCondition === "CONDITION"}
                                      onChange={this.handleChange}
                                      required
                                    ></Form.Field>
                                    <Form.Field
                                      name="dateFollowupNeededTill"
                                      control={TextArea}
                                      label='Until Condition'
                                      disabled={this.state.dateOrCondition === "DATE"}
                                      onChange={this.handleChange}
                                      required
                                    ></Form.Field>
                                </Form.Group>
                            </Form>
                            }
                            <Form.Field control={Button} style={{"marginTop": "10px"}}>Submit</Form.Field>
                        </Form>
                    </Modal.Description>
                    </Modal.Content>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = ({}) => ({})

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            updateFollowUp,
            createFollowUp,
            setReadingId
        },
            dispatch
    )

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FollowUpModal)
