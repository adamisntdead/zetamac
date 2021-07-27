import React, { useState, useEffect } from "react";
import { Card, CardHeader, Box, Typography, Tabs, Tab } from "@material-ui/core";
import { useParams, Link } from "react-router-dom";
import { useTheme } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import moment from 'moment'
import ResultsTable from '../ResultsTable'
import { firestore } from "../../firebase";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

// const scores = [
//   { date: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"), score: 31 },
//   { date: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"), score: 21 },
//   { date: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"), score: 31 },
//   { date: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"), score: 31 },
//   { date: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"), score: 11 },
//   { date: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"), score: 21 },
//   { date: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"), score: 31 },
//   { date: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"), score: 1231 },
//   { date: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"), score: 1 }
// ]

function LeaderboardCard(props) {
  const { userId, user } = props;
  const [value, setValue] = useState(0);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const orderBy = value == 0 ? 'score' : 'date'
    return firestore
      .collection("game-scores")
      .orderBy(orderBy, 'desc')
      .limit(25)
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.docs.map(d => {
            return {
              score: d.data().score,
              date: moment(d.data().date).format("MMMM Do YYYY, h:mm:ss a"),
              fullName: d.data().username,
              initials: d.data().firstName == "" ? "" : `${d.data().firstName}${d.data().lastName ? ' ' + d.data().lastName : ''}`.split(" ").map((n) => n[0]).join("").toUpperCase()
            }
          })
          setScores(data)
          setLoading(false);
          // setUser(snapshot.data());
        }
      );
  }, [userId, value]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  return (
    <Card>
      <CardHeader
        title="Alphamac Leaderboard"
      // subheader={user.username}
      />
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        aria-label="full width tabs example"
      >
        <Tab label="High Scores" {...a11yProps(0)} />
        <Tab label="Recent Scores" {...a11yProps(1)} />
      </Tabs>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel value={value} index={0} dir={theme.direction}>
          {scores.length == 0 && !loading ? 'This user has not completed any games.' : <ResultsTable name={true} scores={scores} loading={loading} />}
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          {scores.length == 0 && !loading ? 'This user has not completed any games.' : <ResultsTable name={true} scores={scores} loading={loading} />}
        </TabPanel>
      </SwipeableViews>
    </Card>
  );
}


export default LeaderboardCard;
