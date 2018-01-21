const scrapper = require('./scrapper');
const csv = require('fast-csv');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const isWin = /^win/.test(process.platform);
const out = path.normalize(`${__dirname}/../out`);

async function main() {
	try {

		const categories = await scrapper.grabCategories();
		const categoriesStream = fs.createWriteStream(`${out}/categories.csv`, {encoding: "utf8"});
		isWin && await categoriesStream.write("\ufeff");


		csv
			.writeToStream(categoriesStream,
				categories.map(item => [item.name])
			, {headers: true});


		const companies = await scrapper.grabTop10Companies();
		const companiesStream = fs.createWriteStream(`${out}/companies.csv`, {encoding: "utf8"});
		isWin && await companiesStream.write("\ufeff");

		csv
			.writeToStream(companiesStream,
				companies.map(({id, name}) => [id, name])
				, {headers: true});


		const fields = ['id',
			'company',
			'title',
			'href',
			'desc',
			'date',
			'cities',
			'salary'];

		const toArray = vacancy => fields.map(key => vacancy[key]);
		const toFileName = name => name.replace(/(\\|\/)/gi,'_');

		for (const category of categories) {
			const vacancies = await scrapper.grabVacancies(category.id);

			const stream = fs.createWriteStream(`${out}/${toFileName(category.name)}.csv`, {encoding: "utf8"});
			isWin && await stream.write("\ufeff");
			csv
				.writeToStream(stream, [
					fields,
					...vacancies.map(toArray)
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

