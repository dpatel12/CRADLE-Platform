import { Statistic } from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';
import { useStatisticsStyles } from './statisticStyles';
import { Bar } from 'react-chartjs-2';
import { Toast } from 'src/shared/components/toast';
import { initialData, initialColorReading } from '../utils';
import Skeleton from '@material-ui/lab/Skeleton';
import { apiFetchSafe } from '../utils';

interface IProps {
  url: string;
}

export const StatisticDashboard: React.FC<IProps> = ({ url }) => {
  const classes = useStatisticsStyles();

  const [data, setData] = useState(initialData);
  const [colorReading, setColorReading] = useState(initialColorReading);
  const [loaded, setloaded] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    setloaded(false);
    apiFetchSafe(url)
      .then((response) => {
        setData(response);
        setColorReading(response);
        setloaded(true);
      })
      .catch((err) => {
        setErrorLoading(true);
      });
  }, [url]);

  const barData = {
    labels: ['Green', 'Yellow Up', 'Yellow Down', 'Red Up', 'Red Down'],
    datasets: [
      {
        label: 'Traffic Light',
        data: [
          colorReading.color_readings.GREEN,
          colorReading.color_readings.YELLOW_UP,
          colorReading.color_readings.YELLOW_DOWN,
          colorReading.color_readings.RED_UP,
          colorReading.color_readings.RED_DOWN,
        ],
        backgroundColor: [
          '#289672',
          '#ffd384',
          '#ffab73',
          '#f05454',
          '#af2d2d',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    legend: {
      labels: {
        fontColor: 'black',
      },
    },
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  };

  return (
    <div>
      {errorLoading && (
        <Toast
          severity="error"
          message="Something went wrong loading those statistics. Please check your internet connection and try again."
          onClose={() => setErrorLoading(false)}
          open={errorLoading}
        />
      )}
      {!loaded && (
        <Skeleton
          className={classes.skeleton}
          variant="rect"
          width={800}
          height={400}
        />
      )}
      {loaded && (
        <div className={classes.center}>
          <Statistic.Group className={classes.statisticGroup}>
            {data.patients_referred !== undefined && (
              <Statistic horizontal className={classes.statistic}>
                <Statistic.Value>{data.patients_referred}</Statistic.Value>
                <Statistic.Label className={classes.verticalWriting}>
                  Patient Referred
                </Statistic.Label>
              </Statistic>
            )}

            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value>{data.days_with_readings}</Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                Days With Readings
              </Statistic.Label>
            </Statistic>

            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value>{data.sent_referrals}</Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                Referrals Sent
              </Statistic.Label>
            </Statistic>

            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value>{data.total_readings}</Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                Total Readings
              </Statistic.Label>
            </Statistic>

            <Statistic horizontal className={classes.statistic}>
              <Statistic.Value>{data.unique_patient_readings}</Statistic.Value>
              <Statistic.Label className={classes.verticalWriting}>
                Unique Patient Readings
              </Statistic.Label>
            </Statistic>
          </Statistic.Group>
          <br />

          <h2>Traffic lights</h2>
          <div className={classes.chart}>
            <Bar data={barData} options={options} />
          </div>
        </div>
      )}
    </div>
  );
};
