function filterUndefined(data) {
    if (!data || typeof data !== "object") {
      return data;
    }
    const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = typeof value === "object" ? filterUndefined(value) : value;
      }
      return acc;
    }, {});
  
    return filteredData;
}


function convertObjtoArray(data) {
   return Object.keys(data).map((item) => { return data[item]})
}

function formatResponses (data) {
    let ids = Object.keys(data.responses)
    let responses = convertObjtoArray(data.responses)
    let responseWithId = responses.map((item, index) => {
        return {
            ...item,
            id: ids[index]
        }
    })
  
    return {
        ...data,
        responses: [
            ...responseWithId,
        ]
    }
}
module.exports = {
    filterUndefined,
    convertObjtoArray,
    formatResponses
}