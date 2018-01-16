const fetch = require('fetch-cookie/node-fetch')(require('node-fetch'));
const links = require('./links');
const {getCategoriesFromPage, getCompaniesFromPage, getCSRFTokenFromPage, getVacanciesFromPage, getVacanciesFromRss} = require('../parser');

const timeout = ms => new Promise(res => setTimeout(res, ms));

const buildQuery = (params) =>
	Object
		.entries(params)
		.map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
		.join('&');

const fetchXHRVacancies = async (url, referer, CSRFToken, count) =>
	fetch(url, {
		method: "POST",
		credentials: 'include',
		headers: {
			'Referer': referer,
			'Accept': 'application/json, text/javascript, */*; q=0.01',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		},
		body: buildQuery({
			csrfmiddlewaretoken: CSRFToken,
			count: count
		})
	}).then(responce => responce.json());



const grabVacanciesBuilder = async (htmlLink, jsonLink) => {
	let html = await fetch(htmlLink)
		.then(responce => responce.text());

	console.log(htmlLink);
	const CSRFToken = getCSRFTokenFromPage(html);
	const vacancies = getVacanciesFromPage(html);
	let last, num;

	do {
		await timeout(5000);
		({html, last, num} = await fetchXHRVacancies(
			jsonLink,
			htmlLink,
			CSRFToken, vacancies.length));
		const xhrVacancies = getVacanciesFromPage(html);
		vacancies.push(...xhrVacancies);
	} while (!last);

	return vacancies;
};


const grabCompanyVacancies = async (company) => grabVacanciesBuilder(
	links.getCompanyVacanciesPage(company),
	links.getCompanyVacanciesJSON(company)
);

const grabCategoryVacancies = async (category) => grabVacanciesBuilder(
	links.getCategoryVacanciesPage(encodeURIComponent(category)),
	links.getCompanyVacanciesJSON(encodeURIComponent(category))
);


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



module.exports = {
	grabCompanyVacancies,
	grabCategories,
	grabTop10Companies,
	grabCategoryVacancies
};