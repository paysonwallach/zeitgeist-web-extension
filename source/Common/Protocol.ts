import { v4 as uuidv4 } from "uuid"
import { JsonProperty, Serializable } from "typescript-json-serializer"

@Serializable()
export class Subject {
    constructor(
        @JsonProperty()
        public readonly currentOrigin?: string,
        @JsonProperty()
        public readonly currentUri?: string,
        @JsonProperty()
        public readonly interpretation?: string,
        @JsonProperty()
        public readonly manifestation?: string,
        @JsonProperty()
        public readonly mimetype?: string,
        @JsonProperty()
        public readonly origin?: string,
        @JsonProperty()
        public readonly storage?: string,
        @JsonProperty()
        public readonly text?: string,
        @JsonProperty()
        public readonly uri?: string
    ) {}
}

@Serializable()
export class Event {
    constructor(
        @JsonProperty()
        public readonly subjects: Subject[],
        @JsonProperty()
        public readonly timestamp: number,
        @JsonProperty()
        public readonly id?: number,
        @JsonProperty()
        public readonly actor?: string,
        @JsonProperty()
        public readonly interpretation?: string,
        @JsonProperty()
        public readonly manifestation?: string,
        @JsonProperty()
        public readonly origin?: string,
        @JsonProperty()
        public readonly payload?: BinaryType
    ) {
        if (id === undefined) this.id = 0
    }
}

@Serializable()
class Message {
    @JsonProperty()
    public readonly apiVersion: string = "v2"

    @JsonProperty()
    public readonly id: string = uuidv4()

    @JsonProperty()
    public readonly context?: string

    constructor(context?: string) {
        this.context = context
    }
}

@Serializable()
class InsertEventsRequestData {
    constructor(
        @JsonProperty()
        public readonly events: Event[]
    ) {}
}

@Serializable()
export class InsertEventsRequest extends Message {
    @JsonProperty()
    public readonly data: InsertEventsRequestData

    constructor(events: Event[]) {
        super()

        this.data = new InsertEventsRequestData(events)
    }
}
