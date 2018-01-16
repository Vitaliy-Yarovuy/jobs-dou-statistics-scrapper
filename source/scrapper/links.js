const encodeUrl = require('encodeurl');
const encode = x => encodeURIComponent(x.replace(/\s+/gi, ' '));

exports.getRootPage = () => `https://jobs.dou.ua/`;
exports.getTop50Page = () => `https://jobs.dou.ua/top50/`;

exports.getCompanyVacanciesPage = (company) => `https://jobs.dou.ua/companies/${encode(company)}/vacancies/`;
exports.getCompanyVacanciesJSON = (company) => `https://jobs.dou.ua/vacancies/${encode(company)}/xhr-load/`;
exports.getCompanyVacanciesRSS = (company) => `https://jobs.dou.ua/vacancies/${encode(company)}/feeds/`;

exports.getCategoryVacanciesPage = (category) => `https://jobs.dou.ua/vacancies/?category=${encode(category)}`;
exports.getCategoryVacanciesJSON = (category) => `https://jobs.dou.ua/vacancies/xhr-load/?category=${encode(category)}`;

exports.getSearchVacanciesRSS = (query) => `https://jobs.dou.ua/vacancies/feeds/?search=${encode(query)}`;
