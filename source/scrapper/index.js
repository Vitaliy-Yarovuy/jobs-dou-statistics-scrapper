const links = require('./links');
const {grabCategories, grabTop10Companies, grabCategoryVacanciesByRss, grabCompanyVacanciesByRss, grabSearchVacanciesByRss} = require('./proccessor');

const MAX_ITERATIONS_COUNT = 99;
const timeout = ms => new Promise(res => setTimeout(res, ms));


const grabVacancies = async (categoryId) => {
	const vacancies = await grabCategoryVacanciesByRss(categoryId);
	return vacancies;
};


module.exports = {
	grabCategories,
	grabTop10Companies,
	grabVacancies,
};
