
import wartNode from './wart-node.js';

const statusElement = document.querySelector('#status');
const progressElement = document.querySelector('#progress');
const spinnerElement = document.querySelector('#spinner');
const npeersElement = document.querySelector('#npeers');
const peersTableElement = document.querySelector('#peersTable');
const lengthElement = document.querySelector('#length');
const difficultyElement = document.querySelector('#difficulty');
const totalWorkElement = document.querySelector('#totalWork');
const nmempoolElement = document.querySelector('#nmempool');
const mempooolTableElement = document.querySelector('#mempoolTable');
const consoleElement = document.querySelector('#console');


function format_hash(N)
{
	var i=0
	while (N >= 1000 && i <= 10)
	{
		N /= 1000
		i += 1;
	}
	return N.toFixed(2) +' '+ (['h', 'kh', 'Mh', 'Gh', 'Th', 'Ph', 'Eh', 'Zh', 'Yh', 'Rh', 'Qh'][i])
}

const onChain = event =>
{
	lengthElement.innerHTML = event.length;
	difficultyElement.innerHTML = format_hash(event.difficulty);
	totalWorkElement.innerHTML = format_hash(event.worksum);
};

const onConnect = event =>
{
	npeersElement.innerHTML = event.total;

	// insert row 
	let row = peersTableElement.insertRow(0);
	row.id = 'con-'+event.id
	let cell0 = row.insertCell(0);
	cell0.innerHTML = event.inbound;
	row.insertCell(1).innerHTML = event.type;
	row.insertCell(2).innerHTML = event.address;
	row.insertCell(3).innerHTML = event.since;
};

const onDisconnect = event =>
{
	npeersElement.innerHTML = event.total;
	let rowId = 'con-' + event.id
	document.querySelector(`#${rowId}`).remove();
};

const onMempoolAdd = event =>
{
	console.log(event);

	// still need to erase old entry if it exists
	nmempoolElement.innerHTML = event.total;
	let rowId = 'mempool-' + event.id
	let elem = document.querySelector(`#${rowId}`);
	if (elem != null)
	{
		elem.remove();
	}

	// insert row 
	let row = mempooolTableElement.insertRow(0);
	row.id = rowId
	row.insertCell(0).innerHTML = event.fromAddress;
	row.insertCell(1).innerHTML = event.toAddress;
	row.insertCell(2).innerHTML = event.amount;
	row.insertCell(3).innerHTML = event.fee;
	row.insertCell(4).innerHTML = event.txHash;
};

const onMempoolErase = event =>
{
	nmempoolElement.innerHTML = event.total;
	let rowId = 'mempool-' + event.id
	let elem = document.querySelector(`#${rowId}`);
	if (elem != null)
	{
		elem.remove();
	}
};

const preRun = module => module.ENV.WS_PEERS = 'wss://node1.warthog.network/ws;wss://node2.warthog.network/ws';'wss://node100.warthog.network/ws';

const print = (...texts) =>
{
	const text = Array.prototype.slice.call(texts).join(' ');

	// These replacements are necessary if you render to raw HTML
	//text = text.replace(/&/g, "&amp;");
	//text = text.replace(/</g, "&lt;");
	//text = text.replace(/>/g, "&gt;");
	//text = text.replace('\n', '<br>', 'g');

	console.log(text);

	consoleElement.value += text + "\n";
	consoleElement.scrollTop = consoleElement.scrollHeight; // focus on bottom
};

const setStatus = text =>
{
	// if (!setStatus.last) setStatus.last = { time: Date.now(), text: '' };
	// if (text === Module.setStatus.last.text) return;
	// var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
	// var now = Date.now();
	// if (m && now - Module.setStatus.last.time < 30) return; // if this is a progress update, skip it if too soon
	// Module.setStatus.last.time = now;
	// Module.setStatus.last.text = text;

	// if (m)
	// {
	// 	text = m[1];
	// 	progressElement.value = parseInt(m[2])*100;
	// 	progressElement.max = parseInt(m[4])*100;
	// 	progressElement.hidden = false;
	// 	spinnerElement.hidden = false;
	// }
	// else
	// {
	// 	progressElement.value = null;
	// 	progressElement.max = null;
	// 	progressElement.hidden = true;
	// 	if (!text) spinnerElement.style.display = 'none';
	// }

	statusElement.innerHTML = text;
};

let totalDependencies = 0;

const monitorRunDependencies = left =>
{
	totalDependencies = Math.max(totalDependencies, left);
    setStatus(left ? 'Preparing... (' + (totalDependencies-left) + '/' + totalDependencies + ')' : 'All downloads complete.');
};

setStatus('Downloading...');

window.onerror = event =>
{
	// TODO: do not warn on ok events like simulating an infinite loop or exitStatus
	setStatus('Exception thrown, see JavaScript console');
	spinnerElement.style.display = 'none';
	// setStatus = text =>
	// {
	// 	if (text) console.error('[post-exception status] ' + text);
	// };
};

wartNode({onChain, onConnect, onDisconnect, onMempoolAdd, onMempoolErase, preRun, print, setStatus, totalDependencies, monitorRunDependencies});
