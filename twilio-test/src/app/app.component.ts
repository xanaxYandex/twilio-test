import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {VideoService} from "./video.service";
import {RemoteParticipant, Room} from "twilio-video";
import {createLogErrorHandler} from "@angular/compiler-cli/ngcc/src/execution/tasks/completion";

declare const Video: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    public room: Room | undefined;
    public roomName = '';
    public name = '';
    public token = '';
    public connectOptions: any = {
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
        video: {height: 720, frameRate: 40, width: 1280}

    };
    deviceIds = {
        audio: localStorage.getItem('audioDeviceId'),
        video: localStorage.getItem('videoDeviceId')
    };

    @ViewChild('video', {static: false}) video: ElementRef | any;

    get participants(): RemoteParticipant[] {
        return Array.from(this.room?.participants as any || []).map((i: any) => i[1]) as RemoteParticipant[];
    }

    constructor(private videoSrv: VideoService) {
    }

    ngOnInit() {
    }

    public muteLocalParticipantsAudio(): void {
        this.room?.localParticipant.audioTracks.forEach(publication => {
            if (publication.track.isEnabled) {
                publication.track.disable();
            } else {
                publication.track.enable();
            }
        });
    }

    public muteLocalParticipantsVideo(): void {
        this.room?.localParticipant.videoTracks.forEach(publication => {
            if (publication.track.isEnabled) {
                publication.track.disable();
            } else {
                publication.track.enable();
            }
        });
    }

    public async promiseWrapper(): Promise<any> {
        this.token = await this.videoSrv.getToken(this.name).toPromise();

        await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        const devices = await navigator.mediaDevices.enumerateDevices();

        const video = devices.find(i => i.kind === 'videoinput')?.deviceId;

        this.connectOptions.audio = {deviceId: {exact: 'default'}};
        this.connectOptions.name = 'Test Room 1';
        this.connectOptions.video.deviceId = {exact: video};

        this.room = await Video.connect(this.token, this.connectOptions) as Room;
        console.log(this.room);
        console.log(this.participants);

        this.room.on('participantConnected', (participant: any) => {
            console.log('USER CONNECTED----------------------------');
            participant.tracks.forEach((publication: any) => {
                if (publication.track) {
                    (this.video.nativeElement as HTMLElement).appendChild(publication.track.attach());
                }
            });

            participant.on('trackSubscribed', (track: any) => {
                console.log('TRACK SUBSCRIBED----------------------------');
                (this.video.nativeElement as HTMLElement).appendChild(track.attach());
            });
        });

        this.room.on('participantDisconnected', (participant: any) => {
            console.log('USER DISCONNECTED----------------------------');
            console.log(participant)
        });

    }
}
