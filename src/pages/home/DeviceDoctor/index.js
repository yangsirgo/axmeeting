import React from 'react';
import { StoreNim, StoreNetcall, StoreChatroom, StoreEventPool } from "store";
const NimState = StoreNim.state;
import { Button, VolumeMeter } from 'component';
import Slider from 'react-input-slider';
import audio_url from 'assets/music/audio.mp3'

import check_url from 'assets/images/check.png'
import error_url from 'assets/images/error2.png'


export default class DeviceDoctor extends React.Component {
    constructor(props) {
        super()
        this.state = {
            audioOut: [],
            currentAudioOut: '',
            audioOutOk: false,
            audioVolume: 50,// 扬声器音量
            audioMeterValue: 0,// 扬声器频谱指示值 0 - 100
            audioIn: [],
            currentAudioIn: '',
            audioInOk: false,
            video: [],
            currentVideo: '',
            videoOk: false,
            currentStep: 1,
            canResponse: false,
        }
        NIM.use(WebRTC)
        window.netcall = this.netcall = window.WebRTC.getInstance({
            container: null,
            remoteContainer: null,
            debug: false,
            nim: NimState.nim,
            chromeId: 'gapafbpmfemleaplicdhhcikajbogpkf'
        })

        if (/^https:/.test(location.protocol) || /localhost/.test(location.hostname)) {
            console.log('OK')
        } else {
            console.warn('非https://协议或 localhost,可能导致demo无法运行')
        }

        window.netcall = this.netcall
        this.netcall.on('deviceStatus', this.getDevices)
        this.getDevices()
    }
    componentWillUnmount() {
        this.netcall.destroy()
        this.cleanSpeakerTest();
        this.netcall.off('deviceStatus')
        navigator.mediaDevices.ondevicechange = null;
    }

    getDevices = () => {
        //navigator.mediaDevices.enumerateDevices().then(this.gotDevices).catch(handleError);
        this.netcall.getDevices().then(async deviceInfos => {
            console.warn('设备列表：', deviceInfos)
            let audioIn = deviceInfos['audioIn'] || [];
            let audioOut = deviceInfos['audioOut'] || [];
            let video = deviceInfos['video'] || [];
            await this.cleanSpeakerTest();
            await this.cleanMicphoneTest();
            await this.cleanCameraTest();

            let { currentAudioIn, currentAudioOut, currentVideo, canResponse } = this.state;

            if (!audioOut.some(audio => audio.deviceId === currentAudioOut)) {
                await this.cleanSpeakerTest();
                canResponse = false
                currentAudioOut = (audioOut[0] || { deviceId: "" }).deviceId;
            }
            if (!audioIn.some(audio => audio.deviceId === currentAudioIn)) {
                await this.cleanMicphoneTest()
                canResponse = false
                currentAudioIn = (audioIn[0] || { deviceId: "" }).deviceId;
            }
            if (!video.some(v => v.deviceId === currentVideo)) {
                await this.cleanCameraTest()
                canResponse = false
                currentVideo = (video[0] || { deviceId: "" }).deviceId;
            }


            this.setState({
                audioIn: audioIn,
                currentAudioIn: (audioIn[0] || { deviceId: "" }).deviceId,
                audioOut: audioOut,
                currentAudioOut: (audioOut[0] || { deviceId: "" }).deviceId,
                video: video,
                currentVideo: (video[0] || { deviceId: "" }).deviceId,
                canResponse: false,
            }, () => {
                if (this.state.currentStep === 3) {
                    setTimeout(() => {
                        this.checkCamera()
                    }, 300)
                }
            })
        })
    }
    onSpeakerChange = (e) => {
        let deviceId = e.target.value;
        this.setState({ currentAudioOut: deviceId })

        this.audio && this.audioPlay.setSinkId(deviceId).then(() => {
            setTimeout(() => {
                this.audio.currentTime = this.audioPlay.currentTime
            }, 20)
            console.log('Audio output device attached: ' + deviceId);
        })
            .catch(function (error) {
                console.error(error)
                // ...
            });

        console.log(e.target.value)
    }
    onMicphoneChange = (e) => {
        let deviceId = e.target.value;
        this.setState({ currentAudioIn: deviceId }, async () => {
            await this.cleanMicphoneTest()
            await new Promise(res => setTimeout(res, 500))// 增加时间，防止火狐不弹出提示框
            await this.checkMicphone()
        })
    }
    onCameraChange = (e) => {
        let deviceId = e.target.value;
        this.setState({ currentVideo: deviceId }, async () => {
            // await this.cleanMicphoneTest()
            await this.checkCamera()
        })
    }

    cleanSpeakerTest = () => {
        if (this.audio) {
            this.setState({
                audioMeterValue: 0,
                audioVolume: 50
            })
            this.analyser.onaudioprocess = () => { }
            this.analyser.disconnect(this.dest);
            this.source.disconnect(this.analyser);

            this.contextA.close();

            this.audioPlay.pause();

            this.audio.removeAttribute('src')
            this.audio.load()
            this.audioPlay.removeAttribute('src');
            this.audioPlay.load();


            this.audio = null;
            this.audioPlay = null;
            this.analyser = null;
            this.contextA = null;
            this.source = null;
            this.dest = null;
        }
    }
    checkSpeaker = () => {
        // 检测扬声器
        let audio = this.audio;
        if (!audio) {
            // 5秒后可以点击
            setTimeout(() => this.setState({ canResponse: true }), 5000)

            audio = this.audio = new Audio(audio_url)
            this.audioPlay = new Audio(audio_url)
            this.audioPlay.volume = this.state.audioVolume / 100

            this.audioPlay.loop = true;
            audio.loop = true;
            audio.play()
            audio.muted
            this.audioPlay.play();

            let AudioContextFactory = AudioContext || webkitAudioContext;
            let context = this.contextA = new AudioContextFactory();
            let source = this.source = context.createMediaElementSource(audio)
            let dest = this.dest = context.createMediaStreamDestination()

            // var analyser = context.createAnalyser();
            var analyser = this.analyser = context.createScriptProcessor(1024, 1, 1);
            //连接：source → analyser → destination
            source.connect(analyser);
            analyser.connect(dest);
            analyser.onaudioprocess = (e) => {
                // no need to get the output buffer anymore
                var int = e.inputBuffer.getChannelData(0);
                // console.log(int)
                var max = 0;
                for (var i = 0; i < int.length; i++) {
                    max = int[i] > max ? int[i] : max;
                }
                this.setState({
                    audioMeterValue: Math.floor(100 * max)
                })
            }
        } else {
            this.audioPlay.currentTime = this.audio.currentTime = 0;
        }
    }
    cleanMicphoneTest = async () => {
        clearInterval(this.micphoneTimmer)
        this.micphoneTimmer = null
        if (this.state.audioOutOk) {
            await this.netcall.stopDevice(WebRTC.DEVICE_TYPE_AUDIO_OUT_LOCAL)
        }
        await this.netcall.stopDevice(WebRTC.DEVICE_TYPE_AUDIO_IN)

        this.micphoneApi = null
    }
    checkMicphone = async () => {
        //检测麦克风
        setTimeout(() => this.setState({ canResponse: true }), 5000)
        if (!this.micphoneTimmer) {
            await this.netcall.startDevice({
                type: WebRTC.DEVICE_TYPE_AUDIO_IN,
                device: { deviceId: this.state.currentAudioIn }
            })

            if (this.state.audioOutOk) {
                await this.netcall.startDevice({
                    type: WebRTC.DEVICE_TYPE_AUDIO_OUT_LOCAL,
                    device: { deviceId: this.state.currentAudioOut }
                })
            }

            // 设置采集音量大小
            this.netcall.setCaptureVolume(~~(255 * (this.state.audioVolume / 100)))
            console.log(~~(255 * (this.state.audioVolume / 100)))
            let webAudio = this.netcall.adapterRef.audioHelperLocal.webAudio;
            this.micphoneTimmer = setInterval(() => {
                this.setState({
                    audioMeterValue: Math.floor((webAudio && webAudio.instant * 100) || 0)
                })
            }, 100);

            console.log('开始测试麦克风')
        }
    }
    cleanCameraTest = async () => {
        try {
            let previewDom = document.getElementById('js-doctor-video')
            await this.netcall.stopDevice({ type: WebRTC.DEVICE_TYPE_VIDEO })
            await this.netcall.stopLocalStream(previewDom)
        } catch (e) {
            console.error(e)
        }
    }
    checkCamera = async () => {
        setTimeout(() => this.setState({ canResponse: true }), 3000)
        let previewDom = document.getElementById('js-doctor-video')
        try {
            await this.netcall.stopDevice({ type: WebRTC.DEVICE_TYPE_VIDEO })
            await this.netcall.stopLocalStream(previewDom)
        } catch (e) {
            console.error(e)
        }

        await this.netcall.startDevice({
            type: WebRTC.DEVICE_TYPE_VIDEO,
            device: { deviceId: this.state.currentVideo }
        })

        await this.netcall.startLocalStream(previewDom)
        var param = {
            width: 240,
            height: 130,
            cut: false
        }
        netcall.setVideoViewSize(param)

    }
    onSpeakerRangeChanged = ({ x }) => {
        this.setState({ audioVolume: x });
        this.audioPlay && (this.audioPlay.volume = x / 100);
    }
    onMicphoneRangeChanged = ({ x }) => {
        this.setState({ audioVolume: x });
        // this.audioPlay && (this.audioPlay.volume = x / 100);
        this.netcall.setCaptureVolume(~~(255 * (this.state.audioVolume / 100)))

    }

    nextStep(yes) {
        let { currentStep, audioInOk, audioOutOk, videoOk } = this.state;
        switch (currentStep) {
            case 1: {
                audioOutOk = yes;
                this.cleanSpeakerTest()
                break;
            }
            case 2: {
                audioInOk = yes;
                this.cleanMicphoneTest();
                break;
            }
            case 3: {
                videoOk = yes
                this.cleanCameraTest()
                break;
            }
            case 4: {

            }
        }
        this.setState({
            currentStep: currentStep + 1,
            audioVolume: 50,
            audioMeterValue: 0,
            videoOk, audioInOk, audioOutOk,
            canResponse: false,
        }, () => {
            if (this.state.currentStep === 3) {
                this.checkCamera()
            }
        })
    }
    renderStep1() {
        const { audioOut, currentAudioOut, audioVolume, audioMeterValue } = this.state;
        return (
            <div className="doctor-speaker">
                <div className="u-row">
                    <span className="u-col-4">
                        选择扬声器
                    </span>
                    <div className="u-col-20">
                        <select value={currentAudioOut} onChange={this.onSpeakerChange}>
                            {audioOut.map((device, index) => (
                                <option key={device.deviceId}
                                    value={device.deviceId}>{device.label || '扬声器 ' + index}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="u-row">
                    <span className="u-col-4">
                        扬声器音量
                    </span>
                    <div className="u-col-20">
                        <Slider
                            styles={{ active: { backgroundColor: '#076bf2' } }}
                            x={audioVolume}
                            onChange={this.onSpeakerRangeChanged}
                        ></Slider>
                    </div>
                </div>
                <div className="u-row">
                    <span className="u-col-4">
                        <Button className="cube-btn" disabled={!!this.audio} onClick={this.checkSpeaker}>扬声器测试</Button>
                    </span>
                    <div className="u-col-20">
                        <VolumeMeter width={400} value={audioMeterValue}></VolumeMeter>
                    </div>
                </div>
            </div>
        )
    }
    renderStep2() {
        const { audioIn, currentAudioIn, audioVolume, audioMeterValue } = this.state;
        return (
            <div className="doctor-speaker">
                <div className="u-row">
                    <span className="u-col-4">
                        选择麦克风
                    </span>
                    <div className="u-col-20">
                        <select value={currentAudioIn}
                            onChange={this.onMicphoneChange}>
                            {audioIn.map((device, index) => (
                                <option key={device.deviceId}
                                    value={device.deviceId}>
                                    {device.label || '麦克风 ' + index}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="u-row">
                    <span className="u-col-4">
                        麦克风音量
                    </span>
                    <div className="u-col-20">
                        <Slider
                            styles={{ active: { backgroundColor: '#076bf2' } }}
                            x={audioVolume}
                            onChange={this.onMicphoneRangeChanged}
                        ></Slider>
                    </div>
                </div>
                <div className="u-row">
                    <span className="u-col-4">
                        <Button className="cube-btn"
                            disabled={!!this.micphoneTimmer}
                            onClick={this.checkMicphone}>麦克风测试</Button>
                    </span>
                    <div className="u-col-20">
                        <VolumeMeter width={400} value={audioMeterValue}></VolumeMeter>
                    </div>
                </div>
            </div>
        )
    }
    renderStep3() {
        const { video, currentVideo, canResponse, audioVolume, audioMeterValue } = this.state;
        return (
            <div className="doctor-speaker">
                <div className="u-row">
                    <span className="u-col-4">
                        选择摄像头
                    </span>
                    <div className="u-col-20">
                        <select value={currentVideo}
                            onChange={this.onCameraChange}>
                            {video.map((device, index) => (
                                <option key={device.deviceId}
                                    value={device.deviceId}>
                                    {device.label || '摄像头 ' + index}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="u-row">
                    <div className="f-tac">
                        <div id="js-doctor-video"></div>
                    </div>
                </div>
            </div>
        )
    }
    renderStep4() {
        const { videoOk, audioInOk, audioOutOk,
            audioIn, audioOut, video,
            currentAudioIn, currentAudioOut, currentVideo
        } = this.state;
        const allOk = videoOk && audioInOk && audioOutOk;
        const speakerName = (audioOut.find(x => x.deviceId == currentAudioOut) || { label: '未知扬声器' }).label
        const micName = (audioIn.find(x => x.deviceId == currentAudioIn) || { label: '未知麦克风' }).label
        const cameraName = (video.find(x => x.deviceId == currentVideo) || { label: '未知摄像头' }).label
        return (
            <div className="doctor-result">
                <div className="u-row f-tac">
                    <div className="modal-face">
                        {allOk
                            ? <svg width="60px" height="60px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#515151" d="M922.694 336.994c-22.447-53.07-54.574-100.725-95.491-141.641-40.916-40.916-88.57-73.044-141.641-95.491-54.961-23.246-113.325-35.033-173.472-35.033S393.58 76.616 338.619 99.862c-53.07 22.447-100.725 54.575-141.641 95.491-40.917 40.916-73.044 88.571-95.491 141.641-23.247 54.961-35.034 113.325-35.034 173.472 0 60.147 11.787 118.511 35.034 173.472 22.447 53.07 54.574 100.725 95.49 141.641 40.917 40.917 88.571 73.044 141.642 95.491 54.961 23.246 113.325 35.033 173.472 35.033s118.511-11.787 173.472-35.033c53.07-22.447 100.725-54.574 141.641-95.491 40.917-40.916 73.044-88.571 95.491-141.641 23.246-54.961 35.033-113.325 35.033-173.472 0-60.147-11.788-118.511-35.034-173.472zM512.091 892.103c-210.436 0-381.637-171.202-381.637-381.637s171.202-381.637 381.637-381.637S893.728 300.03 893.728 510.465 722.526 892.103 512.091 892.103zM328.252 418.546m-76.599 0a76.599 76.599 0 1 0 153.198 0 76.599 76.599 0 1 0-153.198 0ZM695.93 418.546m-76.599 0a76.599 76.599 0 1 0 153.198 0 76.599 76.599 0 1 0-153.198 0ZM732.466 588.229c-16.279-6.879-35.053 0.741-41.932 17.021-30.374 71.885-100.417 118.334-178.443 118.334-78.026 0-148.069-46.449-178.444-118.334-6.879-16.28-25.653-23.899-41.932-17.021-16.28 6.879-23.9 25.652-17.021 41.932 40.408 95.631 133.592 157.424 237.397 157.424 103.806 0 196.989-61.793 237.396-157.424 6.879-16.28-0.742-35.054-17.021-41.932z" /></svg>
                            : <svg width="60px" height="60px" viewBox="120 10 180 210" xmlns="http://www.w3.org/2000/svg">
                                <g id="svg_5">
                                    <path id="svg_4" d="m291.54503,84.66959c-4.49172,-10.61948 -10.92044,-20.1554 -19.10807,-28.34283c-8.18743,-8.18743 -17.72315,-14.61635 -28.34284,-19.10807c-10.99787,-4.6516 -22.6767,-7.01022 -34.71232,-7.01022s-23.71424,2.35862 -34.71212,7.01022c-10.61949,4.49172 -20.15541,10.92064 -28.34284,19.10807c-8.18762,8.18743 -14.61634,17.72335 -19.10806,28.34283c-4.65181,10.99788 -7.01042,22.67671 -7.01042,34.71233c0,12.03561 2.35861,23.71444 7.01042,34.71232c4.49172,10.61948 10.92044,20.15541 19.10786,28.34283c8.18763,8.18763 17.72335,14.61635 28.34304,19.10807c10.99788,4.6516 22.67671,7.01022 34.71232,7.01022s23.71445,-2.35862 34.71232,-7.01022c10.61949,-4.49172 20.15541,-10.92044 28.34284,-19.10807c8.18763,-8.18742 14.61635,-17.72335 19.10807,-28.34283c4.6516,-10.99788 7.01022,-22.67671 7.01022,-34.71232c0,-12.03562 -2.35882,-23.71445 -7.01042,-34.71233zm-82.16303,111.07916c-42.10894,0 -76.36683,-34.25809 -76.36683,-76.36683s34.25809,-76.36684 76.36683,-76.36684s76.36683,34.25789 76.36683,76.36664s-34.25809,76.36703 -76.36683,76.36703zm-52.11451,-94.76033a15.32771,15.32771 0 1 0 30.65543,0a15.32771,15.32771 0 1 0 -30.65543,0zm73.57359,0a15.32771,15.32771 0 1 0 30.65543,0a15.32771,15.32771 0 1 0 -30.65543,0z" fill="#515151" />
                                    <rect id="svg_12" height="13.978502" width="81.720475" y="140.375291" x="168.47906" fill="#515151" />
                                </g>
                            </svg>}

                        {allOk
                            ? <div className="text-explain"><h5>设备正常</h5><p>设备没有问题，可以正常上课</p></div>
                            : <div className="text-explain"><h5>设备检测未通过</h5><p>不必担心，您可通过设置进行进一步检测<br />仍有问题可联系客服解决</p></div>}
                    </div>
                    <div className="u-row">
                        <div className="u-col-6 f-tar">
                            <svg role="camera" width="20px" height="20px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#515151" d="M520.896 815.296c197.952 0 358.976-166.08 358.976-370.112S718.784 75.072 520.896 75.072 162.048 241.088 162.048 445.184s160.96 370.112 358.848 370.112z m0-676.224c162.688 0 294.976 137.344 294.976 306.112 0 168.832-132.288 306.112-294.976 306.112-162.624 0-294.848-137.344-294.848-306.112-0.064-168.768 132.224-306.112 294.848-306.112zM824.256 746.112a32.128 32.128 0 0 0-29.888 56.64c21.888 11.584 27.264 20.736 27.52 22.528-1.92 20.864-106.688 69.824-300.992 69.824-191.488 0-299.072-49.536-300.864-69.824 0.128-1.664 5.056-10.432 26.176-21.888a32 32 0 0 0-30.464-56.256c-49.344 26.688-59.712 57.216-59.712 78.144 0 91.968 189.12 133.824 364.864 133.824 175.808 0 364.992-41.856 364.992-133.824 0-21.248-10.688-52.224-61.632-79.168zM520.96 618.816a173.632 173.632 0 1 0 0.128-347.264 173.632 173.632 0 0 0-0.128 347.264z m-59.968-315.648a70.976 70.976 0 1 1 0 141.952 70.976 70.976 0 0 1 0-141.952z" /></svg>
                        </div>
                        <div className="u-col-12 f-tal">
                            <p className="device-name" title={speakerName}> {speakerName} </p>
                        </div>
                        <div className="u-col-6 f-tal">
                            {audioOutOk ? <img className="diy-icon" src={check_url} /> : <img className="diy-icon" src={error_url} />}
                        </div>
                    </div>
                    <div className="u-row">
                        <div className="u-col-6 f-tar">
                            <svg role="headphone" width="20px" height="20px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#515151" d="M896 512h-42.666667v-85.333333c0-188.202667-153.130667-341.333333-341.333333-341.333334s-341.333333 153.130667-341.333333 341.333334v85.333333H128a42.666667 42.666667 0 0 0-42.666667 42.666667v256a42.666667 42.666667 0 0 0 42.666667 42.666666h85.333333a42.666667 42.666667 0 0 0 42.666667-42.666666v-384c0-141.184 114.816-256 256-256s256 114.816 256 256v384a42.666667 42.666667 0 0 0 42.666667 42.666666h85.333333a42.666667 42.666667 0 0 0 42.666667-42.666666v-256a42.666667 42.666667 0 0 0-42.666667-42.666667z" /><path fill="#515151" d="M298.666667 512h85.333333v341.333333H298.666667z m341.333333 0h85.333333v341.333333h-85.333333z" /></svg>
                        </div>
                        <div className="u-col-12 f-tal">
                            <p className="device-name" title={micName}> {micName} </p>
                        </div>
                        <div className="u-col-6 f-tal">
                            {audioInOk ? <img className="diy-icon" src={check_url} /> : <img className="diy-icon" src={error_url} />}
                        </div>
                    </div>
                    <div className="u-row">
                        <div className="u-col-6 f-tar">
                            <svg width="20px" height="20px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#515151" d="M480 704A160 160 0 0 0 640 544v-384a160 160 0 1 0-320 0v384A160 160 0 0 0 480 704zM704 448v96a224 224 0 1 1-448 0V448H192v96a288 288 0 0 0 256 286.208V960H320v64h320v-64H512v-129.792A288 288 0 0 0 768 544V448h-64z" /></svg>
                        </div>
                        <div className="u-col-12 f-tal">
                            <p className="device-name" title={cameraName}> {cameraName} </p>
                        </div>
                        <div className="u-col-6 f-tal">
                            {videoOk ? <img className="diy-icon" src={check_url} /> : <img className="diy-icon" src={error_url} />}
                        </div>
                    </div>
                    <p><Button className="cube-btn" onClick={() => this.props.hide()}>确认</Button></p>
                </div>

            </div>
        )
    }

    render() {
        const { currentStep, canResponse, audioOutOk } = this.state
        return (
            <div className="device-doctor">
                <div className="doctor-header">设备检测</div>
                {currentStep == 1 && this.renderStep1()}
                {currentStep == 2 && this.renderStep2()}
                {currentStep == 3 && this.renderStep3()}
                {currentStep !== 4 &&
                    <div className="doctor-questions">
                        {currentStep === 1 &&
                            <div className="u-row">
                                <div className="u-col-16">是否听见播放的音乐？</div>
                                <div className="u-col-8 f-tar">
                                    <Button className="cube-btn" disabled={!canResponse} onClick={() => this.nextStep(true)}>是</Button>
                                    &nbsp;&nbsp;
                            <Button className="cube-btn" disabled={!canResponse} onClick={() => this.nextStep(false)}>否</Button>
                                </div>
                            </div>
                        }
                        {currentStep === 2 &&
                            <div className="u-row">
                                <div className="u-col-16">{audioOutOk ? '是否听见麦克风回放？' : '上方音量条是否随声音变化？'}</div>
                                <div className="u-col-8 f-tar">
                                    <Button className="cube-btn" disabled={!canResponse} onClick={() => this.nextStep(true)}>是</Button>
                                    &nbsp;&nbsp;
                            <Button className="cube-btn" disabled={!canResponse} onClick={() => this.nextStep(false)}>否</Button>
                                </div>
                            </div>
                        }

                        {currentStep === 3 &&
                            <div className="u-row f-tac">
                                <p>能否清晰的看到摄像头捕获画面？</p>
                                <p> <Button className="cube-btn" disabled={!canResponse} onClick={() => this.nextStep(true)}>是</Button>
                                    &nbsp;&nbsp;
                            <Button className="cube-btn" disabled={!canResponse} onClick={() => this.nextStep(false)}>否</Button></p>
                            </div>
                        }

                        <div className="f-tac">
                            <span className={"step-indi " + (currentStep > 0 ? "active" : "")}>1</span>
                            <span className={"step-indi " + (currentStep > 1 ? "active" : "")}>2</span>
                            <span className={"step-indi " + (currentStep > 2 ? "active" : "")}>3</span>
                        </div>
                    </div>
                }
                {currentStep === 4 && this.renderStep4()}
            </div>)
    }
}