const links = require('./links');
const {grabTop10Companies, grabCompanyVacancies, grabCategoryVacancies, grabCategories, grabCompanyVacanciesByRss, grabSearchVacanciesByRss} = require('./proccessor');

const MAX_ITERATIONS_COUNT = 99;
const timeout = ms => new Promise(res => setTimeout(res, ms));


const populateCategories = async (categories) => {
	const data = {};
	for (let category of categories) {
		const vacancies = await grabCategoryVacancies(category);
		// console.log(category, vacancies.length);
		data[category] = vacancies.map(vacancy => vacancy.id);
	}
	return data;
};


const fillItemsAttrs = (dest, source, attrs) => {
	return dest.reduce((acc, dItem) => {
		const sItem = source.filter(item => item.id === dItem.id)[0];
		if (sItem) {
			for (let attr of attrs) {
				dItem[attr] = sItem[attr];
			}
			acc.filled.push(dItem);
		} else {
			acc.notFilled.push(dItem);
		}
		return acc;
	}, {filled: [], notFilled: []})

};


const populateVacanciesByCategory = (vacancies, categories) => {
	for (let vacancy of vacancies) {
		for(let key in  categories){
			const ids = categories[key];
			if(ids.indexOf(vacancy.id) !== -1){
				vacancy.category = key;
				break;
			}
		}
	}
	return vacancies;
};

const populateVacanciesByDate = async (vacancies, companyId) => {

	const queries = {};
	const getQuery = (notFilled) => {
		let i, query;
		for (i = 0; i < notFilled.length; i++) {
			query = notFilled[i].title;
			if(!queries[query]){
				queries[query] = true;
				return query;
			}
		}
	};

	let rssVacancies = await grabCompanyVacanciesByRss(companyId);
	let {filled, notFilled} = fillItemsAttrs(vacancies, rssVacancies, ['date']);

	for (let i = 0; notFilled.length && i < MAX_ITERATIONS_COUNT; i++) {
		const query = getQuery(notFilled);
		rssVacancies = await grabSearchVacanciesByRss(query);
		({filled, notFilled} = fillItemsAttrs(notFilled, rssVacancies, ['date']));
	}

	if(notFilled.length){
		console.log('notFound vacancies:',notFilled.length, notFilled);
	}

	return vacancies;
};

const grabVacancies = async (companyId, categoriesDict) => {
	const vacancies = await grabCompanyVacancies(companyId);
	await populateVacanciesByDate(vacancies, companyId);
	populateVacanciesByCategory(vacancies, categoriesDict);
	return vacancies;
};


module.exports = {
	grabCategories,
	grabTop10Companies,
	populateCategories,
	grabVacancies,
};
