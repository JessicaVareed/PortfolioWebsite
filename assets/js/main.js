/*
 * Jessica Vareed — portfolio
 * 01 Theme toggle · 02 Header · 03 Mobile menu · 04 Active nav link
 * 05 Project filter · 06 Reveal on scroll · 07 Typed role · 08 Footer year
 * 09 Certificates show more
 */
(function () {
	'use strict';

	var root = document.documentElement;
	var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* 01. THEME TOGGLE
	   The head script applies a saved choice before paint; with no
	   saved choice the CSS follows the system setting. */
	var toggle = document.querySelector('.theme-toggle');
	var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

	function currentTheme() {
		return root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');
	}

	function labelToggle() {
		var next = currentTheme() === 'dark' ? 'light' : 'dark';
		toggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
	}

	toggle.addEventListener('click', function () {
		var next = currentTheme() === 'dark' ? 'light' : 'dark';
		root.setAttribute('data-theme', next);
		try { localStorage.setItem('theme', next); } catch (e) {}
		labelToggle();
	});
	systemDark.addEventListener('change', labelToggle);
	labelToggle();

	/* 02. HEADER — solid once the page has scrolled */
	var header = document.querySelector('.site-header');

	function onScroll() {
		header.classList.toggle('is-scrolled', window.scrollY > 16);
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	/* 03. MOBILE MENU */
	var menuBtn = document.querySelector('.menu-toggle');
	var nav = document.getElementById('site-nav');

	function setMenu(open) {
		menuBtn.setAttribute('aria-expanded', String(open));
		menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
		nav.classList.toggle('is-open', open);
		header.classList.toggle('menu-open', open);
	}

	menuBtn.addEventListener('click', function () {
		setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
	});
	nav.addEventListener('click', function (e) {
		if (e.target.closest('a')) setMenu(false);
	});
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && nav.classList.contains('is-open')) {
			setMenu(false);
			menuBtn.focus();
		}
	});
	window.matchMedia('(min-width: 1021px)').addEventListener('change', function (e) {
		if (e.matches) setMenu(false);
	});

	/* 04. ACTIVE NAV LINK — highlights the section in the middle of the screen */
	var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav ul a'));
	var linkFor = {};
	navLinks.forEach(function (a) { linkFor[a.getAttribute('href').slice(1)] = a; });

	if ('IntersectionObserver' in window) {
		var spy = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				navLinks.forEach(function (a) { a.classList.remove('is-active'); });
				var link = linkFor[entry.target.id];
				if (link) link.classList.add('is-active');
			});
		}, { rootMargin: '-45% 0px -50% 0px' });
		document.querySelectorAll('main section[id]').forEach(function (s) { spy.observe(s); });
	}

	/* 05. PROJECT FILTER */
	var filters = document.querySelectorAll('.filter');
	var projects = document.querySelectorAll('.project');

	filters.forEach(function (btn) {
		btn.addEventListener('click', function () {
			var cat = btn.getAttribute('data-filter');
			filters.forEach(function (b) {
				var on = b === btn;
				b.classList.toggle('is-active', on);
				b.setAttribute('aria-pressed', String(on));
			});
			projects.forEach(function (p) {
				p.hidden = cat !== 'all' && p.getAttribute('data-cat') !== cat;
			});
		});
	});

	/* 06. REVEAL ON SCROLL */
	var reveals = document.querySelectorAll('.reveal');

	if (reduceMotion || !('IntersectionObserver' in window)) {
		reveals.forEach(function (el) { el.classList.add('is-visible'); });
	} else {
		var revealer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					revealer.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -8% 0px' });
		reveals.forEach(function (el) { revealer.observe(el); });
	}

	/* 07. TYPED ROLE — types and deletes each role in turn */
	var roleEl = document.querySelector('.role-text');
	var roles = JSON.parse(roleEl.getAttribute('data-roles'));

	if (!reduceMotion && roles.length > 1) {
		var r = 0;
		var i = roles[0].length;
		var deleting = true;
		var holdFirst = true;

		var tick = function () {
			var word = roles[r];
			if (holdFirst) {
				holdFirst = false;
				return setTimeout(tick, 2200);
			}
			i += deleting ? -1 : 1;
			roleEl.textContent = word.slice(0, i);

			if (!deleting && i === word.length) {
				deleting = true;
				return setTimeout(tick, 2200);
			}
			if (deleting && i === 0) {
				deleting = false;
				r = (r + 1) % roles.length;
				return setTimeout(tick, 350);
			}
			setTimeout(tick, deleting ? 35 : 70);
		};
		tick();
	}

	/* 08. FOOTER YEAR */
	document.getElementById('year').textContent = new Date().getFullYear();

	/* 09. CERTIFICATES SHOW MORE — first three visible, the rest on demand */
	var certGrid = document.getElementById('cert-grid');
	var moreBtn = document.querySelector('.cert-more');
	var moreLabel = moreBtn.querySelector('.cert-more-label');
	var extraCount = certGrid.querySelectorAll('.cert-extra').length;

	moreBtn.addEventListener('click', function () {
		var open = moreBtn.getAttribute('aria-expanded') !== 'true';
		certGrid.classList.toggle('is-expanded', open);
		if (open) {
			certGrid.querySelectorAll('.cert-extra').forEach(function (el) { el.classList.add('is-visible'); });
		}
		moreBtn.setAttribute('aria-expanded', String(open));
		moreLabel.textContent = open ? 'Show less' : 'Show ' + extraCount + ' more';
		// After collapsing, bring the section back into view if the reader had scrolled past it
		if (!open && certGrid.getBoundingClientRect().top < 0) {
			document.getElementById('certifications').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
		}
	});
})();
