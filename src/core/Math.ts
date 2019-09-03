let {
    tan,
    sqrt,
    abs,
    max,
    min,
    atan2,
    asin,
    acos,
    sin,
    cos,
} = Math;

export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export function degToRad(degrees: number) {
    return degrees * DEG2RAD;
}

export function clamp(value: number, minValue: number, maxValue: number) {
    return max(minValue, min(value, maxValue));
}


export class Vec2 {

    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public set(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }
}

export class Vec3 {

    public x: number;
    public y: number;
    public z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public set(x: number, y: number = x, z: number = x) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    public isZero() {
        return (this.x === 0) && (this.y === 0) && (this.z === 0);
    }

    public clone() {
        return new Vec3().copy(this);
    }

    public copy(b: Vec3) {
        this.x = b.x;
        this.y = b.y;
        this.z = b.z;
        return this;
    }

    public equals(b: Vec3) {
        return (this.x === b.x) && (this.y === b.y) && (this.z === b.z);
    }

    public add(b: Vec3, out: Vec3 = this) {
        out.x = this.x + b.x;
        out.y = this.y + b.y;
        out.z = this.z + b.z;
        return out;
    }

    public sub(b: Vec3, out: Vec3 = this) {
        out.x = this.x - b.x;
        out.y = this.y - b.y;
        out.z = this.z - b.z;
        return out;
    }

    public length() {
        return sqrt(this.length2());
    }

    public length2() {
        let { x, y, z } = this;
        return x * x + y * y + z * z;
    }

    public normalize(out: Vec3 = this) {
        return this.scale(1 / this.length(), out);
    }

    public scale(s: number, out: Vec3 = this) {
        out.x = this.x * s;
        out.y = this.y * s;
        out.z = this.z * s;
        return out;
    }

    public cross(b: Vec3, out: Vec3 = this) {
        const
            ax = this.x, ay = this.y, az = this.z,
            bx = b.x, by = b.y, bz = b.z;

        out.x = ay * bz - az * by;
        out.y = az * bx - ax * bz;
        out.z = ax * by - ay * bx;

        return out;
    }


    public setFromMatrixPosition(m: Mat4) {
        let me = m.elements;

        this.x = me[12];
        this.y = me[13];
        this.z = me[14];

        return this;
    }

    public setFromSpherical(s: Spherical) {
        return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
    }

    public setFromSphericalCoords(radius: number, phi: number, theta: number) {
        let sinPhiRadius = sin(phi) * radius;
        this.x = sinPhiRadius * sin(theta);
        this.y = cos(phi) * radius;
        this.z = sinPhiRadius * cos(theta);
        return this;
    }

    public toArray(array: number[], offset: number = 0) {
        array[offset] = this.x;
        array[offset + 1] = this.y;
        array[offset + 2] = this.z;
        return array;
    }
}

export class Mat4 {

    public elements: number[] = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]

    public set(
        m00: number, m10: number, m20: number, m30: number,
        m01: number, m11: number, m21: number, m31: number,
        m02: number, m12: number, m22: number, m32: number,
        m03: number, m13: number, m23: number, m33: number,
    ) {
        let te = this.elements;

        te[0] = m00; te[4] = m10; te[8] = m20; te[12] = m30;
        te[1] = m01; te[5] = m11; te[9] = m21; te[13] = m31;
        te[2] = m02; te[6] = m12; te[10] = m22; te[14] = m32;
        te[3] = m03; te[7] = m13; te[11] = m23; te[15] = m33;

        return this;
    }

    public copy(m: Mat4) {

        let te = this.elements;
        let me = m.elements;

        te[0] = me[0]; te[4] = me[4]; te[8] = me[8]; te[12] = me[12];
        te[1] = me[1]; te[5] = me[5]; te[9] = me[9]; te[13] = me[13];
        te[2] = me[2]; te[6] = me[6]; te[10] = me[10]; te[14] = me[14];
        te[3] = me[3]; te[7] = me[7]; te[11] = me[11]; te[15] = me[15];

        return this;
    }

    public clone() {
        return new Mat4().copy(this);
    }

    public perspective(fovy: number, aspect: number, near: number, far: number) {
        const
            f = 1.0 / tan(fovy / 2),
            nf = 1 / (near - far),
            te = this.elements;

        te[0] = f / aspect;
        te[1] = 0;
        te[2] = 0;
        te[3] = 0;

        te[4] = 0;
        te[5] = f;
        te[6] = 0;
        te[7] = 0;

        te[8] = 0;
        te[9] = 0;
        te[10] = (far + near) * nf;
        te[11] = -1;

        te[12] = 0;
        te[13] = 0;
        te[14] = (2 * far * near) * nf;
        te[15] = 0;

        return this;
    }


    public ortho(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        const
            lr = 1 / (left - right),
            bt = 1 / (bottom - top),
            nf = 1 / (near - far),
            te = this.elements;

        te[0] = -2 * lr;
        te[1] = 0;
        te[2] = 0;
        te[3] = 0;

        te[4] = 0;
        te[5] = -2 * bt;
        te[6] = 0;
        te[7] = 0;

        te[8] = 0;
        te[9] = 0;
        te[10] = 2 * nf;
        te[11] = 0;

        te[12] = (left + right) * lr;
        te[13] = (top + bottom) * bt;
        te[14] = (far + near) * nf;
        te[15] = 1;

        return this;
    }

    // // 这个函数的本质就是构造一个朝向目标的旋转矩阵
    // public lookAt = (() => {

    //     let xAxis = new Vec3();
    //     let yAxis = new Vec3();
    //     let zAxis = new Vec3();

    //     return (eye: Vec3, target: Vec3, up: Vec3) => { //这里其实要做两向量是否平行的判断，因为两向量平行叉乘值永远为零向量。
    //         zAxis = eye.sub(target, zAxis).normalize();
    //         xAxis = up.cross(zAxis, xAxis).normalize();
    //         yAxis = zAxis.cross(xAxis, yAxis).normalize();

    //         let te = this.elements;

    //         te[0] = xAxis.x;
    //         te[1] = xAxis.y;
    //         te[2] = xAxis.z;
    //         te[4] = yAxis.x;
    //         te[5] = yAxis.y;
    //         te[6] = yAxis.z;
    //         te[8] = zAxis.x;
    //         te[9] = zAxis.y;
    //         te[10] = zAxis.z;

    //         return this;
    //     }
    // })();

    public lookAt = (() => {

        let xAxis = new Vec3();
        let yAxis = new Vec3();
        let zAxis = new Vec3();

        return (eye: Vec3, target: Vec3, up: Vec3) => {

            eye.sub(target, zAxis);

            if (zAxis.isZero()) {

                //eye and target are in the same position
                zAxis.z = 1;
            }

            zAxis.normalize();
            up.cross(zAxis, xAxis);

            if (xAxis.isZero()) {

                // up and zAxis are parallel
                if (abs(up.z) === 1) {

                    zAxis.x += 0.0001;
                }
                else {

                    zAxis.z += 0.0001;
                }

                zAxis.normalize();
                up.cross(zAxis, xAxis);
            }

            xAxis.normalize();
            zAxis.cross(xAxis, yAxis);

            let te = this.elements;

            te[0] = xAxis.x;
            te[1] = xAxis.y;
            te[2] = xAxis.z;
            te[4] = yAxis.x;
            te[5] = yAxis.y;
            te[6] = yAxis.z;
            te[8] = zAxis.x;
            te[9] = zAxis.y;
            te[10] = zAxis.z;

            return this;
        }
    })();

    public multiply(b: Mat4, out: Mat4 = this) {

        const
            te = this.elements,
            be = b.elements,
            oe = out.elements;

        const
            a00 = te[0], a01 = te[1], a02 = te[2], a03 = te[3],
            a10 = te[4], a11 = te[5], a12 = te[6], a13 = te[7],
            a20 = te[8], a21 = te[9], a22 = te[10], a23 = te[11],
            a30 = te[12], a31 = te[13], a32 = te[14], a33 = te[15];

        let b0 = be[0], b1 = be[1], b2 = be[2], b3 = be[3];
        oe[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        oe[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        oe[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        oe[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = be[4]; b1 = be[5]; b2 = be[6]; b3 = be[7];
        oe[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        oe[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        oe[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        oe[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = be[8]; b1 = be[9]; b2 = be[10]; b3 = be[11];
        oe[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        oe[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        oe[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        oe[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        b0 = be[12]; b1 = be[13]; b2 = be[14]; b3 = be[15];
        oe[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
        oe[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
        oe[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
        oe[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

        return out;
    }

    public compose(quaternion: Quat, position: Vec3, scale: Vec3) {

        const
            x = quaternion.x,
            y = quaternion.y,
            z = quaternion.z,
            w = quaternion.w,

            x2 = x + x,
            y2 = y + y,
            z2 = z + z,

            xx = x * x2,
            xy = x * y2,
            xz = x * z2,
            yy = y * y2,
            yz = y * z2,
            zz = z * z2,
            wx = w * x2,
            wy = w * y2,
            wz = w * z2,
            sx = scale.x,
            sy = scale.y,
            sz = scale.z,

            te = this.elements;

        te[0] = (1 - (yy + zz)) * sx;
        te[1] = (xy + wz) * sx;
        te[2] = (xz - wy) * sx;
        te[3] = 0;
        te[4] = (xy - wz) * sy;
        te[5] = (1 - (xx + zz)) * sy;
        te[6] = (yz + wx) * sy;
        te[7] = 0;
        te[8] = (xz + wy) * sz;
        te[9] = (yz - wx) * sz;
        te[10] = (1 - (xx + yy)) * sz;
        te[11] = 0;
        te[12] = position.x;
        te[13] = position.y;
        te[14] = position.z;
        te[15] = 1;

        return this;
    }

    public invert(out: Mat4 = this) {

        let te = this.elements;
        let oe = out.elements;

        const
            a00 = te[0], a01 = te[1], a02 = te[2], a03 = te[3],
            a10 = te[4], a11 = te[5], a12 = te[6], a13 = te[7],
            a20 = te[8], a21 = te[9], a22 = te[10], a23 = te[11],
            a30 = te[12], a31 = te[13], a32 = te[14], a33 = te[15],

            b00 = a00 * a11 - a01 * a10,
            b01 = a00 * a12 - a02 * a10,
            b02 = a00 * a13 - a03 * a10,
            b03 = a01 * a12 - a02 * a11,
            b04 = a01 * a13 - a03 * a11,
            b05 = a02 * a13 - a03 * a12,
            b06 = a20 * a31 - a21 * a30,
            b07 = a20 * a32 - a22 * a30,
            b08 = a20 * a33 - a23 * a30,
            b09 = a21 * a32 - a22 * a31,
            b10 = a21 * a33 - a23 * a31,
            b11 = a22 * a33 - a23 * a32;

        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        if (det === 0) {

            throw Error("Mat4.invert: can't invert determinant is 0");
        }

        det = 1.0 / det;

        oe[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        oe[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        oe[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        oe[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;

        oe[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        oe[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        oe[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        oe[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;

        oe[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        oe[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        oe[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        oe[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;

        oe[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        oe[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        oe[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        oe[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

        return out;
    }

    public makeTranslation(x: number, y: number, z: number) {

        this.set(
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        )

        return this;
    }

    /**
 * @param euler order is ZYX
 */
    public makeRotationFromEuler(euler: Euler) {

        const
            x = euler.x, y = euler.y, z = euler.z,

            c1 = cos(x), s1 = sin(x),
            c2 = cos(y), s2 = sin(y),
            c3 = cos(z), s3 = sin(z),

            c1c3 = c1 * c3,
            c1s3 = c1 * s3,
            s1c3 = s1 * c3,
            s1s3 = s1 * s3,

            c2c3 = c2 * c3,
            c3s1s2 = s1c3 * s2,
            c1c3s2 = c1c3 * s2,
            c2s3 = c2 * s3,
            s1s2s3 = s1s3 * s2,
            c1s2s3 = c1s3 * s2,
            c3s1 = s1c3,
            c2s1 = c2 * s1,
            c1c2 = c1 * c2;

        this.set(
            c2c3, c3s1s2 - c1s3, s1s3 + c1c3s2, 0,
            c2s3, c1c3 + s1s2s3, c1s2s3 - c3s1, 0,
            -s2, c2s1, c1c2, 0,
            0, 0, 0, 1
        )

        return this;
    }

    public translate(v: Vec3, out: Mat4 = this) {
        return this.tranlateFromCartesianCoords(v.x, v.y, v.z, out);
    }

    public tranlateFromCartesianCoords(x: number, y: number, z: number, out: Mat4 = this) {
        let oe = out.elements;
        oe[12] = x;
        oe[13] = y;
        oe[14] = z;
        oe[15] = 1;
        return out;
    }

    public toArray(array: number[], offset: number = 0) {

        let te = this.elements;

        array[offset] = te[0];
        array[offset + 1] = te[1];
        array[offset + 2] = te[2];
        array[offset + 3] = te[3];

        array[offset + 4] = te[4];
        array[offset + 5] = te[5];
        array[offset + 6] = te[6];
        array[offset + 7] = te[7];

        array[offset + 8] = te[8];
        array[offset + 9] = te[9];
        array[offset + 10] = te[10];
        array[offset + 11] = te[11];

        array[offset + 12] = te[12];
        array[offset + 13] = te[13];
        array[offset + 14] = te[14];
        array[offset + 15] = te[15];

        return array;
    }
}

export class Quat {

    public x: number = 0;
    public y: number = 0;
    public z: number = 0;
    public w: number = 1;

    public set(x: number, y: number, z: number, w: number) {

        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;

        return this;
    }

    public copy(b: Quat) {

        this.x = b.x;
        this.y = b.y;
        this.z = b.z;
        this.w = b.w;

        return this;
    }

    public clone() {

        return new Quat().copy(this);
    }

    public equals(b: Quat) {

        return (this.x === b.x) && (this.y === b.y) && (this.z === b.z) && (this.w === b.w);
    }

    /**
 * http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
 * 
 * assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
 */
    public setFromRotationMatrix(m: Mat4) {

        const
            me = m.elements,
            m11 = me[0], m12 = me[4], m13 = me[8],
            m21 = me[1], m22 = me[5], m23 = me[9],
            m31 = me[2], m32 = me[6], m33 = me[10];

        let trace = m11 + m22 + m33;

        if (trace > 0) {

            let s = 0.5 / sqrt(trace + 1.0);

            this.w = 0.25 / s;
            this.x = (m32 - m23) * s;
            this.y = (m13 - m31) * s;
            this.z = (m21 - m12) * s;

        } else if (m11 > m22 && m11 > m33) {

            let s = 2.0 * sqrt(1.0 + m11 - m22 - m33);

            this.w = (m32 - m23) / s;
            this.x = 0.25 * s;
            this.y = (m12 + m21) / s;
            this.z = (m13 + m31) / s;

        } else if (m22 > m33) {

            let s = 2.0 * sqrt(1.0 + m22 - m11 - m33);

            this.w = (m13 - m31) / s;
            this.x = (m12 + m21) / s;
            this.y = 0.25 * s;
            this.z = (m23 + m32) / s;

        } else {

            let s = 2.0 * sqrt(1.0 + m33 - m11 - m22);

            this.w = (m21 - m12) / s;
            this.x = (m13 + m31) / s;
            this.y = (m23 + m32) / s;
            this.z = 0.25 * s;

        }

        return this;
    }

    /**
 * 
 * @param euler order is ZYX
 */
    public setFromEuler(euler: Euler) {

        let { x, y, z } = euler;

        x *= 0.5;
        y *= 0.5;
        z *= 0.5;

        const
            s1 = sin(x), c1 = cos(x),
            s2 = sin(y), c2 = cos(y),
            s3 = sin(z), c3 = cos(z);

        this.x = s1 * c2 * c3 - c1 * s2 * s3;
        this.y = c1 * s2 * c3 + s1 * c2 * s3;
        this.z = c1 * c2 * s3 - s1 * s2 * c3;
        this.w = c1 * c2 * c3 + s1 * s2 * s3;

        return this;
    }
}

/**
 * order is ZYX
 */
export class Euler {

    /**
     * 弧度
     */
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public copy(b: Euler) {
        this.x = b.x;
        this.y = b.y;
        this.z = b.z;
        return this;
    }

    public clone() {
        return new Euler().copy(this);
    }

    public equals(b: Euler) {
        return (this.x === b.x) && (this.y === b.y) && (this.z === b.z);
    }

    public setFromQuat(q: Quat) {
        const { x, y, z, w } = q;
        this.x = atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y));
        this.y = asin(clamp(2 * (w * y - z * x), -1, 1));
        this.z = atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z));
        return this;
    }

    /**
 * assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
 * 
 * order is ZYX
 */
    public setFromRotationMatrix(m: Mat4) {

        const
            me = m.elements,
            m11 = me[0], m12 = me[4], m13 = me[8],
            m21 = me[1], m22 = me[5], m23 = me[9],
            m31 = me[2], m32 = me[6], m33 = me[10];

        this.y = asin(- clamp(m31, - 1, 1));

        if (abs(m31) < 0.99999) {

            this.x = atan2(m32, m33);
            this.z = atan2(m21, m11);

        } else {

            this.x = 0;
            this.z = atan2(- m12, m22);

        }

        return this;
    }
}

/*
球坐标系与直角坐标系之间的转化：
x = radius * sin(phi) * sin(theta)
y = radius * cos(phi)
z = radius * sin(phi) * cos(theta)

theta = atan2(x, z)
phi = acos(y/radius)
*/
export class Spherical {

    public radius: number;
    public phi: number;
    public theta: number;

    constructor(radius: number = 1, phi: number = 0, theta: number = 0) {
        this.radius = radius;
        this.phi = phi;
        this.theta = theta;
    }

    public setFromVec3(v: Vec3) {
        return this.setFromCartesianCoords(v.x, v.y, v.z);
    }

    public setFromCartesianCoords(x: number, y: number, z: number) {
        this.radius = sqrt(x * x + y * y + z * z);
        if (this.radius === 0) {
            this.theta = 0;
            this.phi = 0;
        } else {
            this.theta = atan2(x, z);
            this.phi = acos(clamp(y / this.radius, - 1, 1));
        }
        return this;
    }
}