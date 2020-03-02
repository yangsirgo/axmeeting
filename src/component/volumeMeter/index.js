import React from 'react';




const HEIGHT = 34;
const WIDTH = 200;
const BLOCK_WIDTH = 4
export default class VolumeMeter extends React.Component {

    constructor(props) {
        super(props);
        this.timmer = setInterval(this.draw, 10)
    }
    componentWillUnmount() {
        clearInterval(this.timmer)
    }

    draw = () => {
        const { width = WIDTH, value = 0, height = HEIGHT } = this.props;
        if (this.lastValue == value) {
            return;
        }
        this.lastValue = value;
        if (this.refs.canvas) {
            let ctx = this.ctx;
            if (!ctx) {
                ctx = this.ctx = this.refs.canvas.getContext('2d');
            }
            // 图形自己的内部参数
            let total = Math.floor(width / BLOCK_WIDTH);
            let fillCount, // 要填充的色块个数
                gap;// 两个色块之间的间隔
            if (total & 1 === 0) {
                // 偶数个填充,不行，必须奇数个
                fillCount = ~~(total / 2);//要填充的色块个数
            } else {
                fillCount = ~~((total + 1) / 2) // 
            }
            gap = (width - BLOCK_WIDTH * fillCount) / (fillCount - 1)

            // 图形外部参数

            let validCount = Math.floor(value)
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = "rgb(0,150,0)";
            let colorChanged = false
            for (let i = 0; i < fillCount; i++) {
                let x = (i) * (BLOCK_WIDTH + gap)
                let y = 0;
                if (i > validCount - 1 && !colorChanged) {
                    ctx.fillStyle = "rgb(200,200,200)"
                    colorChanged = true
                }
                ctx.fillRect(x, y, BLOCK_WIDTH, height);
            }

        }
    }

    resize() {

    }
    render() {
        const { width = WIDTH, height = HEIGHT } = this.props;
        return <canvas ref="canvas" width={width} height={height}></canvas>
    }
}