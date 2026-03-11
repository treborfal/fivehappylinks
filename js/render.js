(function () {
    var REF_PARAM = 'ref=fivehappylinks.com';
    var linksDataCache = null;
    var secondaryDataCache = null;
    var linksDataPromise = null;
    var secondaryDataPromise = null;

    function addRef(url) {
        if (typeof url !== 'string' || !url) {
            return '#';
        }
        if (url.indexOf('ref=fivehappylinks.com') !== -1) {
            return url;
        }
        return url.indexOf('?') === -1 ? url + '?' + REF_PARAM : url + '&' + REF_PARAM;
    }

    function setYear() {
        var yearEl = document.getElementById('year');
        if (yearEl) {
            yearEl.textContent = String(new Date().getFullYear());
        }
    }

    function createLinkRow(link, index, arrowClass, rowClass) {
        var row = document.createElement('div');
        row.className = rowClass || 'happy-link row';

        var numberCol = document.createElement('div');
        numberCol.className = 'col-1 col-1-sm';
        var number = document.createElement('p');
        number.className = 'link-number';
        number.textContent = String(index);
        numberCol.appendChild(number);

        var contentCol = document.createElement('div');
        contentCol.className = 'col-10 col-11-sm';

        var title = document.createElement('p');
        title.className = 'link-title';
        var titleLink = document.createElement('a');
        titleLink.href = addRef(link.linkURL);
        titleLink.target = '_blank';
        titleLink.textContent = link.linkTitle;
        title.appendChild(titleLink);

        var source = document.createElement('p');
        source.className = 'link-source';
        source.textContent = link.linkSource;

        contentCol.appendChild(title);
        contentCol.appendChild(source);

        var arrowCol = document.createElement('div');
        arrowCol.className = 'col-1 hidden-sm';
        var arrow = document.createElement('p');
        arrow.className = 'link-arrow ' + arrowClass;
        var arrowLink = document.createElement('a');
        arrowLink.href = addRef(link.linkURL);
        arrowLink.title = link.linkTitle;
        arrowLink.target = '_blank';
        arrowLink.innerHTML = '&rarr;';
        arrow.appendChild(arrowLink);
        arrowCol.appendChild(arrow);

        row.appendChild(numberCol);
        row.appendChild(contentCol);
        row.appendChild(arrowCol);

        return row;
    }

    function createFeatureColumn(tag, item) {
        var col = document.createElement('div');
        col.className = 'col-4 feature';

        var tagP = document.createElement('p');
        tagP.className = 'tag text-highlight';
        tagP.textContent = tag;

        var title = document.createElement('p');
        title.className = 'feature-title';
        var titleLink = document.createElement('a');
        titleLink.href = addRef(item.linkURL);
        titleLink.target = '_blank';
        titleLink.textContent = item.linkTitle + ' →';
        title.appendChild(titleLink);

        var source = document.createElement('p');
        source.className = 'link-source';
        source.textContent = item.linkSource;

        col.appendChild(tagP);
        col.appendChild(title);
        col.appendChild(source);
        return col;
    }

    function randomItem(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    function clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    function loadLinksData() {
        if (linksDataCache) {
            return Promise.resolve(linksDataCache);
        }
        if (!linksDataPromise) {
            linksDataPromise = fetch('./data/links.json')
                .then(function (response) { return response.json(); })
                .then(function (data) {
                    linksDataCache = data;
                    return data;
                });
        }
        return linksDataPromise;
    }

    function loadSecondaryData() {
        if (secondaryDataCache) {
            return Promise.resolve(secondaryDataCache);
        }
        if (!secondaryDataPromise) {
            secondaryDataPromise = fetch('./data/secondaryLinks.json')
                .then(function (response) { return response.json(); })
                .then(function (data) {
                    secondaryDataCache = data;
                    return data;
                });
        }
        return secondaryDataPromise;
    }

    function loadIndexData() {
        return Promise.all([loadLinksData(), loadSecondaryData()]);
    }

    function buildHappyLinksFragment(linksData) {
        var fragment = document.createDocumentFragment();
        var archive = linksData.archiveLinks || [];

        if (archive.length) {
            var issue = archive[Math.floor(Math.random() * archive.length)];
            issue.fiveLinks.forEach(function (link, index) {
                fragment.appendChild(createLinkRow(link, index + 1, 'textalign-right move'));
            });
        }

        return fragment;
    }

    function buildFeaturedFragment(secondaryData) {
        var fragment = document.createDocumentFragment();
        var watch = randomItem(secondaryData.tvLinks || []);
        var eat = randomItem(secondaryData.foodLinks || []);
        var listen = randomItem(secondaryData.musicLinks || []);

        var featuresRow = document.createElement('div');
        featuresRow.className = 'row';

        if (watch) {
            featuresRow.appendChild(createFeatureColumn('Watch', watch));
        }
        if (eat) {
            featuresRow.appendChild(createFeatureColumn('Eat', eat));
        }
        if (listen) {
            featuresRow.appendChild(createFeatureColumn('Listen', listen));
        }

        fragment.appendChild(featuresRow);

        var row = document.createElement('div');
        row.className = 'row';
        var col = document.createElement('div');
        col.className = 'col-12';
        var border = document.createElement('p');
        border.className = 'border';
        var link = document.createElement('a');
        link.href = '2020.html';
        link.innerHTML = 'See all happy links from 2020 &rarr;';
        border.appendChild(link);
        col.appendChild(border);
        row.appendChild(col);
        fragment.appendChild(row);

        return fragment;
    }

    function swapWithTransition(happyLinksContainer, featuredContainer, happyFragment, featuredFragment) {
        var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            if (happyLinksContainer) {
                clearContainer(happyLinksContainer);
                happyLinksContainer.appendChild(happyFragment);
            }
            if (featuredContainer) {
                clearContainer(featuredContainer);
                featuredContainer.appendChild(featuredFragment);
            }
            return Promise.resolve();
        }

        var updatingContainers = [happyLinksContainer, featuredContainer].filter(Boolean);
        updatingContainers.forEach(function (container) {
            container.style.minHeight = container.offsetHeight + 'px';
            container.classList.add('is-updating');
        });

        return new Promise(function (resolve) {
            window.setTimeout(function () {
                if (happyLinksContainer) {
                    clearContainer(happyLinksContainer);
                    happyLinksContainer.appendChild(happyFragment);
                }
                if (featuredContainer) {
                    clearContainer(featuredContainer);
                    featuredContainer.appendChild(featuredFragment);
                }

                window.setTimeout(function () {
                    updatingContainers.forEach(function (container) {
                        container.classList.remove('is-updating');
                        container.style.minHeight = '';
                    });
                    resolve();
                }, 150);
            }, 150);
        });
    }

    function randomiseIndexLinks() {
        var happyLinksContainer = document.getElementById('happy-links');
        var featuredContainer = document.getElementById('featured-links');

        if (!happyLinksContainer && !featuredContainer) {
            return Promise.resolve();
        }

        return loadIndexData().then(function (results) {
            var linksData = results[0];
            var secondaryData = results[1];
            var happyFragment = buildHappyLinksFragment(linksData);
            var featuredFragment = buildFeaturedFragment(secondaryData);

            return swapWithTransition(happyLinksContainer, featuredContainer, happyFragment, featuredFragment);
        }).catch(function () {
            // Keep page usable even if JSON fetch fails.
        });
    }

    function bindRandomiseLink() {
        var links = document.querySelectorAll('a[href="./"], a[href="/"]');
        Array.prototype.forEach.call(links, function (link) {
            if (link.textContent && link.textContent.replace(/\s+/g, ' ').trim() === 'Randomise') {
                link.addEventListener('click', function (event) {
                    event.preventDefault();
                    randomiseIndexLinks();
                });
            }
        });
    }

    function renderIndexPage() {
        var happyLinksContainer = document.getElementById('happy-links');
        var featuredContainer = document.getElementById('featured-links');
        if (!happyLinksContainer && !featuredContainer) {
            return Promise.resolve();
        }

        return loadIndexData().then(function (results) {
            var linksData = results[0];
            var secondaryData = results[1];

            if (happyLinksContainer) {
                clearContainer(happyLinksContainer);
                happyLinksContainer.appendChild(buildHappyLinksFragment(linksData));
            }

            if (featuredContainer) {
                clearContainer(featuredContainer);
                featuredContainer.appendChild(buildFeaturedFragment(secondaryData));
            }
        }).catch(function () {
            // Keep page usable even if JSON fetch fails.
        });
    }

    function renderArchivePage() {
        var archiveContainer = document.getElementById('archive-links');
        if (!archiveContainer) {
            return Promise.resolve();
        }

        return loadLinksData()
            .then(function (data) {
                var archive = (data.archiveLinks || []).slice().reverse();
                var totalIssueNumber = archive.length;

                archive.forEach(function (week, issueIndex) {
                    var headerRow = document.createElement('div');
                    headerRow.className = 'row';
                    var headerCol = document.createElement('div');
                    headerCol.className = 'col-12 last-week';
                    var header = document.createElement('p');
                    header.className = 'tag text-highlight';
                    header.textContent = 'Issue ' + (issueIndex + 1) + ' of ' + totalIssueNumber + ' — ' + week.date + ', ' + data.year;
                    headerCol.appendChild(header);
                    headerRow.appendChild(headerCol);
                    archiveContainer.appendChild(headerRow);

                    var previousRow = document.createElement('div');
                    previousRow.className = 'previous-link row';

                    week.fiveLinks.forEach(function (link, linkIndex) {
                        previousRow.appendChild(createLinkRow(link, linkIndex + 1, 'textalign-right', 'row'));
                    });

                    archiveContainer.appendChild(previousRow);
                });
            })
            .catch(function () {
                // Keep page usable even if JSON fetch fails.
            });
    }

    setYear();
    bindRandomiseLink();
    renderIndexPage();
    renderArchivePage();
})();
