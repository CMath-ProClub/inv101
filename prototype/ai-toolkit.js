(function(){
  'use strict';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function showToast(message, tone) {
    var container = $('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container fixed bottom-6 right-6 z-50 flex max-w-xs flex-col gap-3';
      document.body.appendChild(container);
    }

    var toneClasses = {
      success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-200',
      error: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-slate-900 dark:text-rose-200',
      info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-slate-900 dark:text-sky-200'
    };

    var toast = document.createElement('div');
    toast.className = 'toast rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl transition-opacity duration-200 ease-out';
    toast.className += ' ' + (toneClasses[tone] || toneClasses.info);
    toast.textContent = message;
    toast.style.opacity = '0';

    container.appendChild(toast);
    requestAnimationFrame(function(){
      toast.style.opacity = '1';
    });

    setTimeout(function(){
      toast.style.opacity = '0';
      setTimeout(function(){
        if (toast.parentNode === container) {
          container.removeChild(toast);
        }
      }, 220);
    }, 3600);
  }

  function fetchJSON(url, options) {
    return fetch(url, Object.assign({ credentials: 'include' }, options || {}))
      .then(function(resp){
        if (!resp.ok) {
          var err = new Error('Request failed');
          err.status = resp.status;
          throw err;
        }
        return resp.json();
      });
  }

  function renderTracks(tracks) {
    var container = document.querySelector('[data-role="track-list"]');
    if (!container) return;
    container.innerHTML = '';
    tracks.forEach(function(track){
      var card = document.createElement('article');
      card.className = 'track-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900';
      card.innerHTML = `
        <h4 class="text-lg font-semibold text-slate-900 dark:text-white">${track.title}</h4>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${track.description || ''}</p>
        <ul class="track-card__modules mt-4 space-y-2"></ul>
        <span class="track-card__badge mt-5 inline-flex items-center gap-2 rounded-full border border-primary-green/40 bg-primary-green/10 px-3 py-1 text-xs font-semibold text-primary-green">${track.badge ? track.badge.name : 'Badge pending'}</span>
      `;
      var list = card.querySelector('.track-card__modules');
      (track.modules || []).forEach(function(mod){
        var li = document.createElement('li');
        li.className = 'flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-900/60 dark:text-slate-300';
        var label = document.createElement('span');
        label.className = 'font-medium text-slate-700 dark:text-slate-200';
        label.textContent = mod.label;
        var duration = document.createElement('span');
        duration.className = 'text-xs text-slate-500 dark:text-slate-400';
        duration.textContent = mod.durationMinutes ? mod.durationMinutes + ' min' : 'self-paced';
        li.appendChild(label);
        li.appendChild(duration);
        list.appendChild(li);
      });
      container.appendChild(card);
    });
  }

  function renderLabs(labs) {
    var container = document.querySelector('[data-role="lab-list"]');
    if (!container) return;
    container.innerHTML = '';
    labs.forEach(function(lab){
      var card = document.createElement('article');
      card.className = 'lab-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900';
      card.innerHTML = `
        <h4 class="text-lg font-semibold text-slate-900 dark:text-white">${lab.title}</h4>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${lab.scenario || ''}</p>
        <h5 class="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Objectives</h5>
        <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-300"></ul>
        <h5 class="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Model Highlights</h5>
        <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-300" data-role="model"></ul>
      `;
      var objectives = card.querySelector('ul');
      (lab.objectives || []).forEach(function(obj){
        var li = document.createElement('li');
        li.className = 'rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/60';
        li.textContent = obj;
        objectives.appendChild(li);
      });
      var modelList = card.querySelector('[data-role="model"]');
      (lab.modelHighlights || []).forEach(function(item){
        var li = document.createElement('li');
        li.className = 'rounded-lg bg-primary-purple/10 px-3 py-2 text-primary-purple dark:bg-primary-purple/20';
        li.textContent = item;
        modelList.appendChild(li);
      });
      container.appendChild(card);
    });
  }

  function renderCases(cases) {
    var container = document.querySelector('[data-role="case-list"]');
    if (!container) return;
    container.innerHTML = '';
    cases.forEach(function(entry){
      var card = document.createElement('article');
      card.className = 'case-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900';
      card.innerHTML = `
        <h4 class="text-lg font-semibold text-slate-900 dark:text-white">${entry.headline}</h4>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${entry.summary || ''}</p>
        <h5 class="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Moderator Takeaways</h5>
        <ul class="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300"></ul>
      `;
      var list = card.querySelector('ul');
      (entry.moderatorTakeaways || []).forEach(function(take){
        var li = document.createElement('li');
        li.className = 'rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/60';
        li.textContent = take;
        list.appendChild(li);
      });
      container.appendChild(card);
    });
  }

  function formatPercent(value) {
    if (typeof value !== 'number') return 'n/a';
    return (value * 100).toFixed(1) + '%';
  }

  function renderSnapshots(snapshots) {
    var container = document.querySelector('[data-role="snapshot-list"]');
    if (!container) return;
    container.innerHTML = '';
    snapshots.forEach(function(snapshot){
      var card = document.createElement('article');
      card.className = 'snapshot-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900';
      card.innerHTML = `
        <header>
          <h4 class="text-lg font-semibold text-slate-900 dark:text-white">${snapshot.company} (${snapshot.symbol})</h4>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${snapshot.summary || ''}</p>
        </header>
        <div class="snapshot-card__metrics mt-4 grid gap-3 sm:grid-cols-2"></div>
        <ul class="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300"></ul>
        <footer class="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-primary-green"></footer>
      `;
      var metrics = card.querySelector('.snapshot-card__metrics');
      var ratios = snapshot.keyRatios || {};
      var metricMap = [
        { label: 'Dividend Yield', value: formatPercent(ratios.dividendYield) },
        { label: 'Payout Ratio', value: formatPercent(ratios.payoutRatio) },
        { label: '5Y CAGR', value: formatPercent(ratios.fiveYearCAGR) },
        { label: 'Net Debt / EBITDA', value: typeof ratios.netDebtToEBITDA === 'number' ? ratios.netDebtToEBITDA.toFixed(1) : 'n/a' }
      ];
      metricMap.forEach(function(metric){
        var metricEl = document.createElement('div');
        metricEl.className = 'rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/60';
        metricEl.innerHTML = '<strong class="block text-slate-700 dark:text-slate-200">' + metric.label + '</strong><div class="mt-1 text-slate-600 dark:text-slate-300">' + metric.value + '</div>';
        metrics.appendChild(metricEl);
      });
      var bullets = card.querySelector('ul');
      (snapshot.qualitativeBullets || []).forEach(function(bullet){
        var li = document.createElement('li');
        li.className = 'rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/60';
        li.textContent = bullet;
        bullets.appendChild(li);
      });
      var footer = card.querySelector('footer');
      (snapshot.sources || []).forEach(function(source){
        var link = document.createElement('a');
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'inline-flex items-center gap-1 rounded-full border border-primary-green/40 bg-primary-green/10 px-3 py-1 text-primary-green transition hover:bg-primary-green/15';
        link.textContent = source.label;
        footer.appendChild(link);
      });
      container.appendChild(card);
    });
  }

  function renderBranches(branches) {
    var container = document.querySelector('[data-role="branch-list"]');
    if (!container) return;
    container.innerHTML = '';
    branches.forEach(function(branch){
      var card = document.createElement('article');
      card.className = 'branch-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900';
      card.innerHTML = `
        <h4 class="text-lg font-semibold text-slate-900 dark:text-white">${branch.title}</h4>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${branch.description || ''}</p>
        <ol class="branch-card__decisions mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300"></ol>
      `;
      var list = card.querySelector('.branch-card__decisions');
      (branch.decisions || []).forEach(function(step){
        var item = document.createElement('li');
        item.className = 'rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/60';
        item.textContent = 'Week ' + step.week + ': ' + step.action;
        list.appendChild(item);
      });
      container.appendChild(card);
    });
  }

  function renderMindful(dashboard) {
    var panel = document.querySelector('[data-role="mindful-panel"]');
    if (!panel) return;
    panel.innerHTML = '';

    var summary = document.createElement('div');
    summary.className = 'mindful-summary rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-sm dark:border-slate-800 dark:bg-slate-900/60';
    summary.innerHTML = `
      <h4 class="text-lg font-semibold text-slate-900 dark:text-white">Headline Mood: ${dashboard.sentimentHeat ? dashboard.sentimentHeat.headlineMood : 'n/a'}</h4>
      <p class="mt-2 text-slate-600 dark:text-slate-300">AI Confidence: ${dashboard.sentimentHeat ? Math.round(dashboard.sentimentHeat.aiConfidence * 100) + '%' : 'n/a'}</p>
      <p class="text-slate-600 dark:text-slate-300">Hype Headlines Flagged: ${dashboard.sentimentHeat ? dashboard.sentimentHeat.hypeHeadlineCount : '0'}</p>
      <p class="text-slate-600 dark:text-slate-300">Cooldown Timer: ${dashboard.sentimentHeat ? dashboard.sentimentHeat.cooldownTimerMinutes + ' minutes' : 'Set yours'}</p>
    `;
    panel.appendChild(summary);

    var nudges = document.createElement('ul');
    nudges.className = 'mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300';
    (dashboard.nudges || []).forEach(function(nudge){
      var li = document.createElement('li');
      li.className = 'rounded-lg bg-primary-green/10 px-3 py-2 text-primary-green dark:bg-primary-green/20';
      li.textContent = nudge;
      nudges.appendChild(li);
    });
    panel.appendChild(nudges);
  }

  function renderBriefings(briefings) {
    var container = document.querySelector('[data-role="briefing-list"]');
    if (!container) return;
    container.innerHTML = '';
    briefings.forEach(function(entry){
      var card = document.createElement('article');
      card.className = 'briefing-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900';
      card.innerHTML = `
        <h4 class="text-lg font-semibold text-slate-900 dark:text-white">Week of ${entry.week}</h4>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${entry.theme || ''}</p>
        <ul class="briefing-card__list mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300"></ul>
      `;
      var list = card.querySelector('.briefing-card__list');
      (entry.highlights || []).forEach(function(item){
        var li = document.createElement('li');
        li.className = 'rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/60';
        li.textContent = item;
        list.appendChild(li);
      });
      container.appendChild(card);
    });
  }

  function renderNotebook(notebook) {
    var panel = document.querySelector('[data-role="notebook-panel"]');
    if (!panel) return;
    panel.innerHTML = '';

    var prompts = document.createElement('div');
    prompts.className = 'notebook-prompts rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-sm dark:border-slate-800 dark:bg-slate-900/60';
    var promptTitle = document.createElement('h4');
    promptTitle.className = 'text-lg font-semibold text-slate-900 dark:text-white';
    promptTitle.textContent = 'Template Prompts';
    prompts.appendChild(promptTitle);
    var list = document.createElement('ul');
    list.className = 'mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300';
    (notebook.templatePrompts || []).forEach(function(prompt){
      var li = document.createElement('li');
      li.className = 'rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-slate-900';
      li.textContent = prompt;
      list.appendChild(li);
    });
    prompts.appendChild(list);
    panel.appendChild(prompts);

    var storage = document.createElement('p');
    storage.className = 'mt-4 text-sm text-slate-600 dark:text-slate-300';
    var storageInfo = notebook.storage || {};
    storage.textContent = 'Storage: ' + (storageInfo.available ? 'Enabled (' + storageInfo.retentionDays + ' day retention)' : 'Planned');
    panel.appendChild(storage);
    if (storageInfo.exportOptions) {
      var exports = document.createElement('p');
      exports.className = 'mt-1 text-sm text-slate-600 dark:text-slate-300';
      exports.textContent = 'Exports: ' + storageInfo.exportOptions.join(', ');
      panel.appendChild(exports);
    }
  }

  function renderTiers(tiers) {
    var container = document.querySelector('[data-role="tier-list"]');
    if (!container) return;
    container.innerHTML = '';
    tiers.forEach(function(tier){
      var card = document.createElement('article');
      card.className = 'tier-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900';
      card.innerHTML = `
        <h4 class="text-lg font-semibold text-slate-900 dark:text-white">${tier.label}</h4>
        <h5 class="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Unlocks</h5>
        <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-300"></ul>
        <h5 class="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Requirements</h5>
        <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-300" data-role="requirements"></ul>
      `;
      var unlockList = card.querySelector('ul');
      (tier.unlocks || []).forEach(function(unlock){
        var li = document.createElement('li');
        li.className = 'rounded-lg bg-primary-green/10 px-3 py-2 text-primary-green dark:bg-primary-green/20';
        li.textContent = unlock;
        unlockList.appendChild(li);
      });
      var reqList = card.querySelector('[data-role="requirements"]');
      (tier.completionNeeds || []).forEach(function(req){
        var li = document.createElement('li');
        li.className = 'rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/60';
        li.textContent = req;
        reqList.appendChild(li);
      });
      container.appendChild(card);
    });
  }

  function renderAudit(logs) {
    var container = document.querySelector('[data-role="audit-log"]');
    if (!container) return;
    container.innerHTML = '';
    logs.forEach(function(entry){
      var card = document.createElement('article');
      card.className = 'audit-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900';
      var sourcesText = Array.isArray(entry.sources) && entry.sources.length ? entry.sources.join(', ') : 'n/a';
      card.innerHTML = `
        <h4 class="text-lg font-semibold text-slate-900 dark:text-white">${entry.symbol} · ${entry.id}</h4>
        <div class="audit-card__meta mt-2 text-sm text-slate-600 dark:text-slate-300">Timestamp: ${entry.timestamp}</div>
        <div class="audit-card__meta text-sm text-slate-600 dark:text-slate-300">Sources: ${sourcesText}</div>
      `;
      if (entry.filters && entry.filters.length) {
        var filters = document.createElement('div');
        filters.className = 'audit-card__meta text-sm text-slate-600 dark:text-slate-300';
        filters.textContent = 'Filters: ' + entry.filters.join(', ');
        card.appendChild(filters);
      }
      container.appendChild(card);
    });
  }

  function renderMentors(mentors) {
    var container = document.querySelector('[data-role="mentor-list"]');
    if (!container) return;
    container.innerHTML = '';
    mentors.forEach(function(mentor){
      var card = document.createElement('article');
      card.className = 'mentor-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900';
      card.innerHTML = `
        <h4 class="text-lg font-semibold text-slate-900 dark:text-white">${mentor.name}</h4>
        <p class="mentor-card__focus mt-2 text-sm text-slate-600 dark:text-slate-300">Focus: ${mentor.focus}</p>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Voice: ${mentor.voice}</p>
      `;
      container.appendChild(card);
    });
  }

  function renderMyths(myths) {
    var container = document.querySelector('[data-role="myth-list"]');
    if (!container) return;
    container.innerHTML = '';
    myths.forEach(function(entry){
      var quiz = entry.quiz || { question: '', choices: [], answerIndex: null };
      var card = document.createElement('article');
      card.className = 'myth-card rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900';
      card.innerHTML = `
        <h4 class="text-lg font-semibold text-slate-900 dark:text-white">Myth</h4>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${entry.myth}</p>
        <h4 class="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Reality</h4>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">${entry.reality}</p>
        <div class="myth-card__quiz mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900/60">
          <strong class="text-slate-700 dark:text-slate-200">Quick Check:</strong>
          <p class="mt-2 text-slate-600 dark:text-slate-300">${quiz.question || ''}</p>
          <ul class="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300"></ul>
          <p class="mt-3 text-xs italic text-slate-500 dark:text-slate-400">Answer index: ${quiz.answerIndex !== null ? quiz.answerIndex : 'n/a'}</p>
        </div>
      `;
      var options = card.querySelector('ul');
      (quiz.choices || []).forEach(function(choice, idx){
        var li = document.createElement('li');
        li.className = 'rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-slate-900';
        li.textContent = (idx + 1) + '. ' + choice;
        options.appendChild(li);
      });
      container.appendChild(card);
    });
  }

  function renderBlueprint(blueprint) {
    var panel = document.querySelector('[data-role="blueprint-panel"]');
    if (!panel) return;
    panel.innerHTML = '';
    var status = document.createElement('p');
    status.className = 'rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300';
    status.textContent = 'Status: ' + (blueprint.status || 'in discovery');
    panel.appendChild(status);
    if (blueprint.integrations) {
      var list = document.createElement('ul');
      list.className = 'mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300';
      blueprint.integrations.forEach(function(item){
        var li = document.createElement('li');
        li.className = 'rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-slate-900';
        li.textContent = item;
        list.appendChild(li);
      });
      panel.appendChild(list);
    }
    if (blueprint.notes) {
      var notes = document.createElement('p');
      notes.className = 'mt-3 text-sm text-slate-600 dark:text-slate-300';
      notes.textContent = 'Notes: ' + blueprint.notes;
      panel.appendChild(notes);
    }
  }

  function handleCoachForm() {
    var form = document.querySelector('[data-role="coach-form"]');
    if (!form) return;
    form.addEventListener('submit', function(evt){
      evt.preventDefault();
      var notes = $('#coachNotes', form).value;
      var biasChecks = Array.prototype.slice.call(form.querySelectorAll('input[name="biasChecks"]:checked')).map(function(input){
        return input.value;
      });
      fetchJSON('/api/ai-toolkit/coach/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headlineNotes: notes, biasChecks: biasChecks })
      }).then(function(body){
        var resultContainer = document.querySelector('[data-role="coach-results"]');
        if (!resultContainer) return;
        resultContainer.hidden = false;
        $('[data-role="coach-score"]').textContent = 'Composite guardrail score: ' + body.coachSummary.score;
        var strengths = $('[data-role="coach-strengths"]');
        strengths.innerHTML = '';
        (body.coachSummary.strengths || []).forEach(function(item){
          var li = document.createElement('li');
          li.className = 'rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-slate-900';
          li.textContent = item;
          strengths.appendChild(li);
        });
        var adjustments = $('[data-role="coach-adjustments"]');
        adjustments.innerHTML = '';
        (body.coachSummary.adjustments || []).forEach(function(item){
          var li = document.createElement('li');
          li.className = 'rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-slate-900';
          li.textContent = item;
          adjustments.appendChild(li);
        });
        var prompts = $('[data-role="coach-prompts"]');
        prompts.innerHTML = '';
        (body.coachSummary.prompts || []).forEach(function(prompt){
          var p = document.createElement('p');
          p.className = 'rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-900/60 dark:text-slate-300';
          p.textContent = prompt;
          prompts.appendChild(p);
        });
      }).catch(function(err){
        showToast('Unable to score notes. Please try again.', 'error');
        console.error(err);
      });
    });
  }

  function handleOnboardingForm() {
    var form = document.querySelector('[data-role="onboarding-form"]');
    if (!form) return;
    var output = document.querySelector('[data-role="onboarding-results"]');
    form.addEventListener('submit', function(evt){
      evt.preventDefault();
      var goal = $('#onboardingGoal', form).value;
      fetchJSON('/api/ai-toolkit/onboarding/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal })
      }).then(function(body){
        if (!output) return;
        output.hidden = false;
        output.textContent = body.message + ' Recommended modules: ' + (body.recommended || []).join(', ');
        showToast('Personalized plan updated.', 'success');
      }).catch(function(err){
        showToast('Unable to build plan right now.', 'error');
        console.error(err);
      });
    });
  }

  ready(function(){
    fetchJSON('/api/ai-toolkit/learning/tracks').then(function(body){ renderTracks(body.tracks || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/labs/scenarios').then(function(body){ renderLabs(body.labs || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/community/cases').then(function(body){ renderCases(body.cases || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/fundamentals/snapshots').then(function(body){ renderSnapshots(body.snapshots || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/simulator/branches').then(function(body){ renderBranches(body.branches || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/mindful/dashboard').then(function(body){ renderMindful(body.dashboard || {}); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/briefings/ai-literacy').then(function(body){ renderBriefings(body.briefings || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/earnings/notebook').then(function(body){ renderNotebook(body.notebook || {}); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/tools/unlocks').then(function(body){ renderTiers(body.tiers || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/audit/logs').then(function(body){ renderAudit(body.logs || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/mentor/personas').then(function(body){ renderMentors(body.mentors || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/myths').then(function(body){ renderMyths(body.myths || []); }).catch(function(err){ console.error(err); });
    fetchJSON('/api/ai-toolkit/brokerage/blueprint').then(function(body){ renderBlueprint(body.blueprint || {}); }).catch(function(err){ console.error(err); });

    handleCoachForm();
    handleOnboardingForm();
  });
})();
