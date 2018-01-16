const scrapper = require('./scrapper');
const csv = require('fast-csv');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const isWin = /^win/.test(process.platform);

async function main() {
	try {
		const out = path.normalize(`${__dirname}/../out`);

		const categories = await scrapper.grabCategories();
		const categoriesStream = fs.createWriteStream(`${out}/categories.csv`, {encoding: "utf8"});
		isWin && await categoriesStream.write("\ufeff");


		csv
			.writeToStream(categoriesStream, [
				categories
			], {headers: true});


		const companies = await scrapper.grabTop10Companies();
		const companiesStream = fs.createWriteStream(`${out}/companies.csv`, {encoding: "utf8"});
		isWin && await companiesStream.write("\ufeff");

		csv
			.writeToStream(companiesStream,
				companies.map(({id, name}) => [id, name])
				, {headers: true});


		const populateCategories = await scrapper.populateCategories(categories);
		const populateCategoriesStream = fs.createWriteStream(`${out}/filled_categories.csv`, {encoding: "utf8"});
		isWin && await populateCategoriesStream.write("\ufeff");

		csv
			.writeToStream(populateCategoriesStream,
				_.unzip(
					Object.entries(populateCategories).map(([key, value]) => [key, ...value])
				)
				, {headers: true});



		for (const company of companies) {
			const vacancies = await scrapper.grabVacancies(company.id, populateCategories);

			const stream = fs.createWriteStream(`${out}/${company.id}.csv`, {encoding: "utf8"});
			isWin && await stream.write("\ufeff");
			csv
				.writeToStream(stream, [
					['id', 'company', 'title', 'href', 'isHot', 'desc', 'cities', 'category', 'date'],
					...vacancies.map(({id, company, title, href, isHot, desc, cities, category, date}) => [id, company, title, href, isHot, desc, cities, category, date])
				], {headers: true});
		}

	} catch (exc) {
		console.log(exc);
	}

}


const s = new Date;

main().then(
	() => {
		const f = new Date;
		console.log(`grab time: ${(f - s) / 1000}s`);
	}
);


// setInterval(() => {}, Number.POSITIVE_INFINITY);