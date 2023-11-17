import * as borsh from "borsh";
const schemaMixture = {
    struct: {
        foo: 'u32',
        bar: 'i32',
        u64Val: 'u64',
        i64Val: 'i64',
        flag: 'bool',
        baz: 'string',
        uint8array: { array: { type: 'u8', len: 2 } },
        arr: { array: { type: { array: { type: 'string' } } } },
        u32Arr: { array: { type: 'u32' } },
        i32Arr: { array: { type: 'i32' } },
        u128Val: 'u128',
        uint8arrays: { array: { type: { array: { type: 'u8', len: 2 } } } },
        u64Arr: { array: { type: 'u64' } },
    }
};
const schemaNumbers = {
    struct: {
        u8: 'u8', u16: 'u16', u32: 'u32', u64: 'u64', u128: 'u128', i8: 'i8',
        i16: 'i16', i32: 'i32', i64: 'i64', f32: 'f32', f64: 'f64'
    }
};
const Numbers = {
    u8: 1,
    u16: 2,
    u32: 3,
    u64: 4n,
    u128: 5n,
    i8: -1,
    i16: -2,
    i32: -3,
    i64: -4n,
    f32: 6.0,
    f64: 7.1,
};
const Mixture = {
    foo: 321,
    bar: 123,
    u64Val: BigInt('4294967297'),
    i64Val: -64n,
    flag: true,
    baz: 'testing',
    uint8array: [240, 241],
    arr: [['testing'], ['testing']],
    u32Arr: [21, 11],
    i32Arr: [],
    u128Val: 128n,
    uint8arrays: [[240, 241], [240, 241]],
    u64Arr: [BigInt('10000000000'), 100000000000n],
};
const encodedNumbers = [
    1, 2, 0, 3, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 255, 254, 255, 253, 255, 255, 255, 252, 255, 255, 255,
    255, 255, 255, 255, 0, 0, 192, 64, 102, 102, 102, 102, 102, 102, 28, 64
];
const encodedMixture = [
    //      i32,          u32,                 u64val,
    65, 1, 0, 0, 123, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0,
    //                              i64val, B,
    192, 255, 255, 255, 255, 255, 255, 255, 1,
    //                                     string,  u8array,        
    7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103, 240, 241,
    // Array<Array<string>>
    2, 0, 0, 0, 1, 0, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116,
    105, 110, 103, 1, 0, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103,
    //                            u32Arr,     i32Arr,
    2, 0, 0, 0, 21, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0,
    //                                          u128,
    128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    //           Array<Uint8Array>,
    2, 0, 0, 0, 240, 241, 240, 241,
    //                                                            u64Arr   
    2, 0, 0, 0, 0, 228, 11, 84, 2, 0, 0, 0, 0, 232, 118, 72, 23, 0, 0, 0
];
const testStructures = {
    schemaMixture,
    schemaNumbers,
    Numbers,
    Mixture,
    encodedNumbers,
    encodedMixture
};
const MyEnumNumbers = { numbers: testStructures.Numbers };
const MyEnumMixture = { mixture: testStructures.Mixture };
const enumSchema = {
    enum: [{ struct: { numbers: testStructures.schemaNumbers } }, { struct: { mixture: testStructures.schemaMixture } }]
};
check_roundtrip(MyEnumNumbers, enumSchema, [0].concat(testStructures.encodedNumbers));
check_roundtrip(MyEnumMixture, enumSchema, [1].concat(testStructures.encodedMixture));
function check_encode(value, schema, expected) {
    const encoded = borsh.serialize(schema, value);
    expect(encoded).toEqual(Uint8Array.from(expected));
}
function check_decode(expected, schema, encoded) {
    const decoded = borsh.deserialize(schema, encoded);
    // console.log(decoded, expected); // visual inspection
    if (expected instanceof BN)
        return expect(BigInt(expected) === decoded).toBe(true);
    if (schema === 'f32')
        return expect(decoded).toBeCloseTo(expected);
    expect(decoded).toEqual(expected);
}
function check_roundtrip(value, schema, encoded) {
    check_encode(value, schema, encoded);
    check_decode(value, schema, encoded);
}
