export default {
    control: {
      backgroundColor: '#fff',
  
      fontSize: 14,
      fontWeight: 'normal',
 
    },
  
    highlighter: {
      overflow: 'hidden',
    },
  
    input: {
      margin: 0,
    },
  
    '&singleLine': {
      control: {
        border: '1px solid silver',

      },
  
      highlighter: {
        padding: 9,
      },
  
      input: {
        padding: 9,
        outline: 0,
        border: 0,
  
        border: '2px',
      },
    },
  
    '&multiLine': {
      control: {
        fontFamily: 'monospace',
        border: '1px solid silver',
      },
  
      highlighter: {
        padding: 9,
      },
  
      input: {
        padding: 9,
        outline: 0,
        border: 0,
      },
    },
  
    suggestions: {
      overflow: 'visible',
      list: {
        backgroundColor: 'white',
        border: '1px solid rgb(0,0,0)',
        fontSize: 14,
        overflow: 'visible',
        margin: 10,
        padding: 5,
        bottom: 9
      },
  
      item: {
        padding: '10px',
  
        '&focused': {
          backgroundColor: '#cee4e5',
        },
      },
    },
  }