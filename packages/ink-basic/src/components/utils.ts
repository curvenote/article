// eslint-disable-next-line import/prefer-default-export
export function getLabelsAndValues(labelsString: string, valuesString: string) {
  const labels = labelsString === '' ? String(valuesString).split(',') : String(labelsString).split(',');
  const values = valuesString === '' ? labels : String(valuesString).split(',');

  if (labels.length !== values.length) {
    // eslint-disable-next-line no-console
    console.warn(`ink-radio, labels and values do not match: labels: "${labelsString}"  values: "${valuesString}"`);
  }
  return { labels, values };
}
