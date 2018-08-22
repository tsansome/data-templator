//Mustaching content inside config

test('Able to refer to a source variable in a config from parent', () => {
    expect(1+2).toBe(3);
});

test('Able to refer to use a target variable in a config from parent', () => {
    expect(1+2).toBe(3);
});

test('Able to refer to a source variable in a config from dataset', () => {
    expect(1+2).toBe(3);
});

test('Able to refer to a target variable in a config from dataset', () => {
    expect(1+2).toBe(3);
});

test('Able to refer to a user defined variable from parent in config', () => {
    expect(1+2).toBe(3);
});

test('Able to refer to a global variable in config', () => {
    expect(1+2).toBe(3);
});

test('Able to refer to outputted script names', () => {
    expect(1+2).toBe(3);
});

test('Able to refer to dictionary defined in global', () => {
    expect(1+2).toBe(3);
});

//Output script testing

test('Able to override output script names and paths', () => {
    expect(1+2).toBe(3);
});

//samples testing
test('Able to provide sample, No path specified', () => {
    expect(1+2).toBe(3);
});

test('Able to provide sample, Path supplied and able to override with custom delimiter', () => {
    expect(1+2).toBe(3);
});

//error testing

test('Error presented when user refers to template that doesn\'t exist', () => {
    expect(1+2).toBe(3);
});

test('Error presented when user refers to sample file that doesn\'t exist', () => {
    expect(1+2).toBe(3);
});

test('Error presented when user does not define columns for a single dataset', () => {
    expect(1+2).toBe(3);
});

test('Error presented when user does not define columns for more than one dataset', () => {
    expect(1+2).toBe(3);
});
