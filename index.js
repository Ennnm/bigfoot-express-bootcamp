import express, { urlencoded } from 'express';
import { read, add } from './jsonFileStorage.mjs';

const app = express();
app.set('view engine', 'ejs');
app.use(urlencoded({ extended: false }));

const sightingText = (year, state, observed) => `
        <h1 style="text-align: center">Big Foot Sighting</h1>
        <ul>
        <li> Year: ${year}</li>
        <li> State: ${state}</li>
        <li> Observed: ${observed}</li>
        </ul>
    `;

function extractNumbers(str) {
  const m = /(^|\s)(\d{4})(\s|$)/.exec(str);
  if (m) {
    return Number(m[2]);
  }
  return NaN;
}
const handleIncomingRequest = (request, response) => {
  read('data.json', (err, data) => {
    const { index } = request.params;
    const refSight = data.sightings[index];
    const content = sightingText(refSight.YEAR, refSight.STATE, refSight.OBSERVED);
    response.send(content);
  });
};

const handleYear = (req, res) => {
  let yearlyReport = '';
  read('data.json', (err, data) => {
    const { sightings } = data;
    const sightingByYear = sightings.filter((sight) => sight.YEAR === req.params.year.toString());
    sightingByYear.forEach((sight) => {
      yearlyReport += sightingText(
        sight.YEAR = extractNumbers(sight.YEAR),
        sight.STATE,
        sight.OBSERVED,
      );
    });

    res.send(yearlyReport);
  });
};

const handleIndex = (req, res) => {
  let attr = req.query.sortBy;

  read('data.json', (err, data) => {
    const { sightings } = data;
    sightings.forEach((sighting, i) => {
      sighting.index = i;
      sighting.YEAR = extractNumbers(sighting.YEAR);
    });
    if (attr) {
      attr = attr.toUpperCase();
      if (attr === 'YEAR' || attr === 'REPORT_NUMBER') {
        sightings.sort((first, second) => Number(first[attr]) - Number(second[attr])); }
      else {
        sightings.sort((a, b) => (a[attr] >= b[attr] ? 1 : -1));
      }
    }
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
const addHandler = (req, res) => {
  add('data.json', 'sightings', req.body, (msg) => { console.log(msg);
    read('data.json', (err, data) => {
      const { sightings } = data;
      res.redirect(`/sightings/${sightings.length - 1}`);
    });
  });
};
const checkABNaN = (a, b) => {
  if (Number.isNaN(a)) {
    return 1;
  }
  if (Number.isNaN(b)) {
    return -1;
  }
  return 0;
};
const handleSightingByYr = (req, res) => {
  const sortOrder = req.query.sort;
  read('data.json', (err, data) => {
    const { sightings } = data;
    sightings.forEach((sighting, i) => {
      sighting.index = i;
      sighting.YEAR = extractNumbers(sighting.YEAR);
    });
    if (sortOrder === 'asc') {
      sightings.sort((a, b) => {
        const aYear = a.YEAR;
        const bYear = b.YEAR;
        const ABcheck = checkABNaN(aYear, bYear);
        if (ABcheck === 0) return aYear - bYear;
        return ABcheck;
      });
    }
    else if (sortOrder === 'desc') {
      sightings.sort((a, b) => {
        const aYear = a.YEAR;
        const bYear = b.YEAR;
        const ABcheck = checkABNaN(aYear, bYear);
        if (ABcheck === 0) return bYear - aYear;
        return ABcheck;
      });
    }
    data.sighting = sightings;
    res.render('year-sightings', data);
  });
};
// index is a URL path parameter
app.get('/sightings/:index', handleIncomingRequest);
app.get('/year-sightings/:year', handleYear);
app.get('/', handleIndex);
app.get('/year', handleIndexYear);
app.post('/submit', addHandler);
app.get('/year-sightings', handleSightingByYr);
app.listen(3004);
