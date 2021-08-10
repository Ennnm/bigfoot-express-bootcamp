import express from 'express';
import { read } from './jsonFileStorage.mjs';

const app = express();
app.set('view engine', 'ejs');

const handleIncomingRequest = (request, response) => {
  read('data.json', (err, data) => {
    console.log(data.sightings.length);
    const { index } = request.params;
    // eslint-disable-next-line no-param-reassign
    const content = `<html>
      <body>
        <h1 style="text-align: center">Big Foot Sighting</h1>
        <ul>
        <li> Year: ${data.sightings[index].YEAR}</li>
        <li> State: ${data.sightings[index].STATE}</li>
        <li> Observed: ${data.sightings[index].OBSERVED}</li>
        </ul>
      </body>
    </html>`;
    response.send(content);
  });
};

const handleYear = (req, res) => {
  const yearlyReport = [];
  read('data.json', (err, data) => {
    const { sightings } = data;
    for (let i = 0; i < sightings.length; i += 1) {
      const refSightings = sightings[i];
      if (refSightings.YEAR === req.params.year.toString()) {
        const sightingsObj = { YEAR: refSightings.YEAR, STATE: refSightings.STATE };
        yearlyReport.push(sightingsObj);
      }
    }
    res.send(yearlyReport);
    console.log(yearlyReport.length);
  });
};

const handleIndex = (req, res) => {
  read('data.json', (err, data) => {
    const { sightings } = data;
    sightings.forEach((sight, i) => {
      sight.index = i;
    });
    console.log(err);

    res.render('index', data);
  });
};

const handleIndexYear = (req, res) => {
  read('data.json', (err, data) => {
    const { sightings } = data;
    const yearSet = new Set();

    sightings.forEach((sight) => {
      const yearStr = sight.YEAR;
      const yearNum = Number(yearStr);

      if (yearNum < 10 || yearNum === 20010) {
        console.log(sight);
      }

      if (!Number.isNaN(yearNum) && yearStr != null) {
        yearSet.add(yearNum);
      }
    });

    const yearArr = [...yearSet];
    yearArr.sort((a, b) => a - b);
    const yearObj = { years: yearArr };
    res.render('years', yearObj);
  });
};
// index is a URL path parameter
app.get('/sightings/:index', handleIncomingRequest);
app.get('/year-sightings/:year', handleYear);
app.get('/', handleIndex);
app.get('/year', handleIndexYear);
app.listen(3004);
