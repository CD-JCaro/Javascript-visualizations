var jsonFile = "data/samples.json";

d3.selectAll('#selDataset').on('change', optionChanged);

function init()
{
    d3.json(jsonFile).then(function(data)
        {
            var metadata = data.metadata;
            var names = data.names;
            var samples = data.samples;

            populateDropdown(names);
            initTable(samples);
            initBubble(samples);
            populateDemographics(metadata,940);
            initGauge(metadata, 940);
        }
    );
}

function populateDropdown(names)
{
    var dropdown = d3.select('#selDataset');

    names.forEach(name => addSelect(name, dropdown));
}

function addSelect(name, dropdown)
{
    //adding our dropdown items and giving a value to use later
    var select = dropdown.append("option").text(`BB_${name}`);
    select.property("value", name);
}

function initTable(samples)
{
    var sample = getSample(samples, "940");
    var sample = trimSample(sample);

    sample.otu_ids = sample.otu_ids.map(id => `OTU ` + id);

    var trace1 = 
    {
        y: sample.otu_ids,
        x: sample.sample_values,
        text: sample.otu_labels,
        name: `BB_940`,
        type: "bar",
        orientation: "h"
    };

    var data = [trace1];

    Plotly.plot("bar", data);
}

function initBubble(samples)
{
    var sample = getSample(samples,"940");

    var trace = {
        x: sample.otu_ids,
        y: sample.sample_values,
        mode: 'markers',
        marker: {
          color: sample.otu_ids,
          size: sample.sample_values
        },
        text: sample.otu_labels
      };

    var data = [trace];

    var layout = 
    {
        xaxis: {title: "OTU ID"}
    };

    Plotly.plot('bubble', data, layout);
}

function populateDemographics(metadata, id)
{
    var meta = getSample(metadata, id);

    //nab our display area and clear it out
    var demoWindow = d3.select('.panel-body');
    demoWindow.html("");

    //loop through our keys and display the data for em
    var metaKeys = Object.keys(meta);

    metaKeys.forEach(key => demoWindow.append('p').text(`${key}: ${meta[key]}`))
}


function initGauge(metadata, id)
{
    var meta = getSample(metadata, id);

    var data = [
        {

            value: meta.wfreq,
            title: { text: "Wash Frequency" },
            gauge: {axis: { range: [0, 9] }},
            type: "indicator",
            mode: "gauge+number"
        }
    ];
    Plotly.plot('gauge', data);
}

function optionChanged(value)
{
    d3.json(jsonFile).then(function(data)
    {
        var sample = getSample(data.samples, value);

        var trimmedSample = trimSample(sample);
        trimmedSample.otu_ids = trimmedSample.otu_ids.map(id => `OTU ` + id);

        Plotly.restyle("bar", 'x', [trimmedSample.sample_values]);
        Plotly.restyle("bar", 'y', [trimmedSample.otu_ids]);
        Plotly.restyle("bar", 'text', [trimmedSample.otu_labels]);

        Plotly.restyle("bubble", 'x', [sample.otu_ids]);
        Plotly.restyle("bubble", 'y', [sample.sample_values]);
        Plotly.restyle("bubble", 'text', [sample.otu_labels]);
        Plotly.restyle("bubble", 'marker', [{color: sample.otu_ids, size: sample.sample_values}]);

        var metadata = data.metadata;
        //have to parseInt here because our value is a string and the metadata id is an int
        populateDemographics(metadata, parseInt(value));

        var meta = getSample(metadata, parseInt(value));

        Plotly.restyle('gauge', 'value', [meta.wfreq]);
    });

}

function getSample(samples, id)
{
    var currSample = samples.find(sample => sample.id === id);

    return currSample;    
}

function trimSample(sample)
{
    // it appears that the samples are already sorted but it feels wrong to just assume that
    // so im sorting them anyways even though it makes this section much longer and way uglier
    var combined = [];
    for(var i = 0; i < sample.sample_values.length; i++)
    {
        combined.push(
            {   'otu_ids': sample.otu_ids[i],
                'otu_labels': sample.otu_labels[i],
                'sample_values': sample.sample_values[i]
            });
    }
    //sorting
    var sortedSample = combined.sort((first, second) => second.sample_values - first.sample_values);

    //finally trimming
    var topTen = sortedSample.slice(0, 10);

    //reverse so our bar chart looks nice
    topTen = topTen.reverse();

    //unpacking
    var currSample = 
    {
        otu_ids: topTen.map(otu => otu.otu_ids),
        otu_labels: topTen.map(otu => otu.otu_labels),
        sample_values: topTen.map(sv => sv.sample_values)
    };

    return currSample;
}

init();