"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.screenshot = void 0;
const chrome_aws_lambda_1 = __importDefault(require("chrome-aws-lambda"));
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
function screenshot() {
    return __awaiter(this, void 0, void 0, function* () {
        let page;
        let browser;
        try {
            const options = process.env.AWS_REGION
                ? {
                    args: chrome_aws_lambda_1.default.args,
                    executablePath: yield chrome_aws_lambda_1.default.executablePath,
                    headless: chrome_aws_lambda_1.default.headless,
                    ignoreDefaultArgs: ['--disable-extensions'],
                }
                : {
                    headless: false,
                    args: [],
                    ignoreDefaultArgs: ['--disable-extensions'],
                    executablePath: process.platform === 'win32'
                        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
                        : process.platform === 'linux'
                            ? '/usr/bin/google-chrome'
                            : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                };
            browser = yield puppeteer_core_1.default.launch(options);
            page = yield browser.newPage();
            yield page.setViewport({ width: 1920, height: 1080 });
            yield page.goto('http://www.prociv.pt/pt-pt/SITUACAOOPERACIONAL/Paginas/default.aspx?cID=11');
            try {
                yield page.waitForFunction(() => document.querySelector('#listOcorrenciasDetails tbody').childElementCount || 0 > 0);
            }
            catch (error) {
                const screenshot = yield page.screenshot({ encoding: 'base64' });
                yield browser.close();
                return `data:image/jpeg;base64,${screenshot}`;
            }
            yield page.evaluate(() => {
                const element = document.querySelector('#listOcorrenciasDetails tbody');
                if (element) {
                    element.scrollIntoView();
                }
            });
            const isElementVisible = (page, cssSelector) => __awaiter(this, void 0, void 0, function* () {
                let visible = true;
                yield page
                    .waitForSelector(cssSelector, { visible: true, timeout: 2000 })
                    .catch(() => {
                    visible = false;
                });
                return visible;
            });
            let loadMoreVisible = yield isElementVisible(page, '#listOcorrenciasDetails > table > tfoot > tr > th > span');
            let loadMoreTries = 0;
            const loadMoreTriesMax = 8;
            try {
                while (loadMoreVisible && loadMoreTries < loadMoreTriesMax) {
                    loadMoreTries += 1;
                    loadMoreVisible = yield isElementVisible(page, '#listOcorrenciasDetails > table > tfoot > tr > th > span');
                    if (loadMoreVisible &&
                        page.$('#listOcorrenciasDetails > table > tfoot > tr > th > span') !== null) {
                        yield page.click('#listOcorrenciasDetails > table > tfoot > tr > th > span');
                        yield page.evaluate(() => {
                            const element = document.querySelector('#listOcorrenciasDetails > table > tfoot > tr > th > span');
                            if (element) {
                                element.scrollIntoView();
                            }
                        });
                    }
                }
            }
            catch (error) {
                const screenshot = yield page.screenshot({ encoding: 'base64' });
                yield browser.close();
                return `data:image/jpeg;base64,${screenshot}`;
            }
            const screenshot = yield page.screenshot({ encoding: 'base64' });
            yield browser.close();
            return `data:image/jpeg;base64,${screenshot}`;
        }
        catch (_a) {
            const screenshot = yield page.screenshot({ encoding: 'base64' });
            yield browser.close();
            return `data:image/jpeg;base64,${screenshot}`;
        }
    });
}
exports.screenshot = screenshot;
