

exports.getRootPage = () => `https://jobs.dou.ua/`;
exports.getTop50Page = () => `https://jobs.dou.ua/top50/`;
exports.getCompanyVacanciesPage = (company) => `https://jobs.dou.ua/companies/${company}/vacancies/`;
exports.getCompanyVacanciesJSON = (company) => `https://jobs.dou.ua/vacancies/${company}/xhr-load/`;
exports.getCategoryVacanciesPage = (category) => `https://jobs.dou.ua/vacancies/?category=${category}`;
exports.getCategoryVacanciesJSON = (category) => `https://jobs.dou.ua/vacancies/xhr-load/?category=${category}`;