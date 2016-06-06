#
# Copyright 2016, Joyent, Inc.
#
# Makefile for node-triton-tags
#

#
# Vars, Tools, Files, Flags
#
JS_FILES	:= $(shell find lib test -name '*.js' | grep -v '/tmp/')
PEGJS_FILES	 = lib/cns-svc-tag.js
JSL_CONF_NODE	 = tools/jsl.node.conf
JSL_FILES_NODE	 = $(JS_FILES)
JSSTYLE_FILES	 = $(JS_FILES)
JSSTYLE_FLAGS	 = -f tools/jsstyle.conf
CLEAN_FILES += ./node_modules

include ./tools/mk/Makefile.defs

#
# Targets
#
.PHONY: all
all: $(PEGJS_FILES)
	npm install

PEGJS		= node_modules/.bin/pegjs
$(PEGJS):
	npm install pegjs
%.js: %.pegjs $(PEGJS)
	$(PEGJS) $< $@

.PHONY: test
test: all
	NODE_NDEBUG= ./node_modules/.bin/tape test/*.test.js

.PHONY: test-in-parallel
test-in-parallel: all
	NODE_NDEBUG= prove -j15 -e ./node_modules/.bin/tape test/*.test.js

.PHONY: clean
clean::
	rm -f $(PEGJS_FILES)
	rm -f triton-tags-*.tgz

check:: versioncheck

# Ensure CHANGES.md and package.json have the same version.
.PHONY: versioncheck
versioncheck:
	@echo version is: $(shell cat package.json | json version)
	[[ `cat package.json | json version` == `grep '^## ' CHANGES.md | head -1 | awk '{print $$2}'` ]]

.PHONY: cutarelease
cutarelease: versioncheck
	[[ `git status | tail -n1` == "nothing to commit, working directory clean" ]]
	./tools/cutarelease.py -p triton-tags -f package.json

.PHONY: git-hooks
git-hooks:
	ln -sf ../../tools/pre-commit.sh .git/hooks/pre-commit

.PHONY: dumpvar
dumpvar:
	@if [[ -z "$(VAR)" ]]; then \
		echo "error: set 'VAR' to dump a var"; \
		exit 1; \
	fi
	@echo "$(VAR) is '$($(VAR))'"

include ./tools/mk/Makefile.deps
include ./tools/mk/Makefile.targ
JSL_FLAGS += --nofilelist
