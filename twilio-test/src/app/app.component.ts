import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {VideoService} from "./video.service";

declare const Video: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    roomName = '';
    name = '';
    token = '';
    connectOptions: any = {
        bandwidthProfile: {
            video: {
                dominantSpeakerPriority: 'high',
                mode: 'collaboration',
                clientTrackSwitchOffControl: 'auto',
                contentPreferencesMode: 'auto'
            }
        },
        dominantSpeaker: true,
        maxAudioBitrate: 16000,
        preferredVideoCodecs: [{codec: 'VP8', simulcast: true}],
        video: {height: 720, frameRate: 24, width: 1280}

    };
    deviceIds = {
        audio: localStorage.getItem('audioDeviceId'),
        video: localStorage.getItem('videoDeviceId')
    };

    @ViewChild('video', {static: false}) video: ElementRef | any;

    constructor(private videoSrv: VideoService) {
    }

    ngOnInit() {
    }

    public async promiseWrapper(): Promise<any> {
        this.token = await this.videoSrv.getToken(this.name).toPromise();
        await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        const devices = await navigator.mediaDevices.enumerateDevices();
        const video = devices.find(i => i.kind === 'videoinput')?.deviceId;
        this.connectOptions.audio = {deviceId: {exact: 'default'}};
        this.connectOptions.name = 'Test Room 1';
        this.connectOptions.video.deviceId = {exact: video};
        console.log(this.connectOptions)

        const room = await Video.connect(this.token, this.connectOptions);
        console.log(room)

        room.on('participantConnected', (participant: any) => {
            participant.tracks.forEach((publication : any) => {
                if (publication.track) {
                    (this.video.nativeElement as HTMLElement).appendChild(publication.track.attach());
                }
            });

            participant.on('trackSubscribed', (track: any) => {
                (this.video.nativeElement as HTMLElement).appendChild(track.attach());
            });
        });

        // Handle a disconnected RemoteParticipant.
        room.on('participantDisconnected', (participant: any) => {
            console.log(participant)
        });


    }
}
