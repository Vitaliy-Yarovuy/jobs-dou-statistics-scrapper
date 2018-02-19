const links = require('./links');
const {getCategoriesFromPage, getCompaniesFromPage, getCSRFTokenFromPage, getVacanciesFromPage, getVacanciesFromRss, hasGetMoreButton} = require('../parser');

const grabCategories = async () => {
	const html = await fetch(links.getRootPage())
		.then(responce => responce.text());
	return getCategoriesFromPage(html);
};

const grabTop10Companies = async () => {
	const html = await fetch(links.getTop50Page())
		.then(responce => responce.text());
	return getCompaniesFromPage(html).splice(0, 10);
};


const grabCompanyVacanciesByRss = async (company) => {
	const xml = await fetch(links.getCompanyVacanciesRSS(company))
		.then(responce => responce.text());
	return getVacanciesFromRss(xml);
};

const grabCategoryVacanciesByRss = async (category) => {
	const xml = await fetch(links.getCategoryVacanciesRSS(category))
		.then(responce => responce.text());
	return getVacanciesFromRss(xml);
};

const grabSearchVacanciesByRss = async (query) => {
	const xml = await fetch(links.getSearchVacanciesRSS(query))
		.then(responce => responce.text());
	return getVacanciesFromRss(xml);
};

module.exports = {
	grabCategories,
	grabTop10Companies,
	grabCategoryVacanciesByRss,
	grabCompanyVacanciesByRss,
	grabSearchVacanciesByRss
};