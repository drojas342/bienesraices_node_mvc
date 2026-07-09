/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/menu.js":
/*!************************!*\
  !*** ./src/js/menu.js ***!
  \************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\ndocument.addEventListener('DOMContentLoaded', () => {\r\n    const btn = document.getElementById('btn-menu-app');\r\n    const menu = document.getElementById('mobile-menu-app');\r\n\r\n    if (!btn || !menu) return;\r\n\r\n    const abrir = () => {\r\n        menu.classList.remove('hidden');\r\n        menu.classList.add('flex');\r\n        btn.setAttribute('aria-expanded', 'true');\r\n        btn.textContent = '✕';\r\n    };\r\n\r\n    const cerrar = () => {\r\n        menu.classList.add('hidden');\r\n        menu.classList.remove('flex');\r\n        btn.setAttribute('aria-expanded', 'false');\r\n        btn.textContent = '☰';\r\n    };\r\n\r\n    btn.addEventListener('click', () => {\r\n        const expandido = btn.getAttribute('aria-expanded') === 'true';\r\n        expandido ? cerrar() : abrir();\r\n    });\r\n\r\n    menu.addEventListener('click', (e) => {\r\n        if (e.target.tagName === 'A') cerrar();\r\n    });\r\n\r\n    window.addEventListener('resize', () => {\r\n        if (window.innerWidth >= 1024) cerrar();\r\n    });\r\n\r\n    document.addEventListener('click', (e) => {\r\n        if (!menu.contains(e.target) && !btn.contains(e.target)) cerrar();\r\n    });\r\n});\n\n//# sourceURL=webpack://bienesraices_mvc_nodejs/./src/js/menu.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/js/menu.js"](0, __webpack_exports__, __webpack_require__);
/******/ 	
/******/ })()
;