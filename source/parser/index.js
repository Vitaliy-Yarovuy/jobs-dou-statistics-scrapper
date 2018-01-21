const parse5 = require('parse5');
const {conditionBuilder, search, getAttr, getText, hasClass} = require('./utils.js');

const parentCheck = (condition) => (node) => node.parentNode && condition(node.parentNode);

//https://jobs.dou.ua/companies/epam-systems/?haha
const getCompanyIdFromLink = (link) => link.split('/').splice(-2).shift();
const getCategoryIdFromLink = (link) => {
	const matches = link.match(/\?category=([^&]+)/);
	return matches && matches[1];
};

//https://jobs.dou.ua/
const getCategoriesFromPage = (responceText) => {
	const doc = parse5.parse(responceText);

	//'a.cat-link'
	const items = search(doc, conditionBuilder('a', {'class': 'cat-link'}));

	return items
		.map(item => ({
			name: getText(item),
			id: getCategoryIdFromLink(getAttr(item, 'href'))
		})).filter(item => item.id);
};

//https://jobs.dou.ua/top50/
const getCompaniesFromPage = (responceText) => {
	const doc = parse5.parse(responceText);

	//#ratingsTableId .company-name > a'
	const table = search(doc, conditionBuilder('table', {id: 'ratingsTableId'}));

	const tdCondition = conditionBuilder('td', {'class': 'company-name'});
	const items = search(doc, conditionBuilder('a', {}, parentCheck(tdCondition)));

	return items
		.map(item => {
			const link = getAttr(item, 'href'),
				name = getText(item),
				id = getCompanyIdFromLink(link);

			return {
				id,
				name
			};
		});
};


//https://jobs.dou.ua/companies/epam-systems/vacancies/
const getVacanciesFromPage = (responceText) => {
	const doc = parse5.parse(responceText);

	//li.l-vacancy
	const items = search(doc, conditionBuilder('li', {'class': 'l-vacancy'}));

	return items
		.map(item => {
			const link = search(item, conditionBuilder('a', {'class': 'vt'}))[0],
				citiesTag = search(item, conditionBuilder('span', {'class': 'cities'}))[0],
				salaryTag = search(item, conditionBuilder('span', {'class': 'salary'}))[0],
				cities = getText(citiesTag),
				salary = getText(salaryTag),
				isHot = hasClass(item, '__hot'),
				href = getAttr(link, 'href'),
				[company, , id,] = href.split('/').splice(-4),
				title = getText(link),
				descTag = search(item, conditionBuilder('div', {'class': 'sh-info'}))[0],
				desc = parse5.serialize(descTag).replace(/\s+/gi, ' ').trim();

			return {
				id,
				company,
				title,
				href,
				isHot,
				desc,
				cities,
				salary
				//category - not present
				//date - not present
			}
		});
};


//https://jobs.dou.ua/vacancies/epam-systems/feeds/
const getVacanciesFromRss = (responceText) => {
	responceText = responceText
		.replace(/\<link\>/gi, '<rlink>')
		.replace(/\<\/link\>/gi, '</rlink>');
	const doc = parse5.parseFragment(responceText);

	const items = search(doc, conditionBuilder('item'));

	return items.map(item => {

		const
			drafTitle = getText(search(item, conditionBuilder('title'))[0]),
			href = getText(search(item, conditionBuilder('rlink'))[0]) || '',
			date = getText(search(item, conditionBuilder('pubdate'))[0]),
			desc = parse5.serialize(search(item, conditionBuilder('description'))[0]).replace(/\s+/gi, ' ').trim(),
			[company, , id,] = href.split('/').splice(-4),
			[title, titleData] = drafTitle.split(' в '),
			[companyName, ...cities] = titleData.split(',').map(i => i.trim());
		let salary;
		if (cities[0] && cities[0].includes('$')) {
			salary = cities.shift();
		}

		return {
			id,
			company,
			title,
			href,
			desc,
			date,
			cities,
			salary
			//category - not present
			//isHot - not present
		}
	});
};


module.exports = {
	getCategoriesFromPage,
	getCompaniesFromPage,
	getVacanciesFromPage,
	getVacanciesFromRss,
};