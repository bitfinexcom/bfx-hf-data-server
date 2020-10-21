'use strict'

const _ = require('lodash')

const HFS = require('bfx-hf-strategy')
const HFU = require('bfx-hf-util')

function parseStrategy (strategyContent) {
  const strategy = {}
  const sections = Object.keys(strategyContent)

  let sectionContent
  let section

  for (let i = 0; i < sections.length; i += 1) {
    section = sections[i]
    sectionContent = strategyContent[section]

    if (section.substring(0, 6) === 'define') {
      strategy[section] = eval(sectionContent) // eslint-disable-line
    } else if (section.substring(0, 2) === 'on') {
      strategy[section] = eval(sectionContent)({ HFS, HFU, _ }) // eslint-disable-line
    }
  }

  return strategy
}

module.exports = parseStrategy
